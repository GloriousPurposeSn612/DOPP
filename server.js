/* =========================================================
   DOPP Class Registration
   Node.js Backend Server
   ========================================================= */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


/* ---------- Configuration ---------- */

const PORT = 3000;

const PUBLIC_DIRECTORY = path.join(__dirname, "public");
const DATABASE_FILE = path.join(__dirname, "database.json");

const sessions = new Map();


/* ---------- Database ---------- */

function readDatabase() {
    try {
        const data = fs.readFileSync(DATABASE_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
}

function writeDatabase(database) {
    fs.writeFileSync(
        DATABASE_FILE,
        JSON.stringify(database, null, 2),
        "utf8"
    );
}


/* ---------- Password Hashing ---------- */

function hashPassword(password) {
    return crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
}


/* ---------- Request Helpers ---------- */

function sendJson(response, statusCode, data) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
    });

    response.end(JSON.stringify(data));
}

function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";

        request.on("data", (chunk) => {
            body += chunk.toString();

            /*
             * Prevent unnecessarily large request bodies.
             * This application only needs a very small JSON body.
             */
            if (body.length > 10_000) {
                request.destroy();
                reject(new Error("Request body is too large."));
            }
        });

        request.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error("Invalid JSON."));
            }
        });

        request.on("error", reject);
    });
}


/* ---------- Validation ---------- */

function validateRegistration(data) {
    const namePattern = /^[A-Z]{3,20}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10}$/;
    const sectionPattern = /^[A-T]$/;
    const pinPattern = /^\d{4}$/;

    if (!namePattern.test(data.firstName)) {
        return "First Name must contain 3–20 capital letters only.";
    }

    if (!namePattern.test(data.lastName)) {
        return "Last Name must contain 3–20 capital letters only.";
    }

    if (!emailPattern.test(data.email)) {
        return "Enter a valid college email address.";
    }

    if (!phonePattern.test(data.phone)) {
        return "Phone Number must contain exactly 10 digits.";
    }

    if (!["B.Tech", "M.Tech", "PHD"].includes(data.program)) {
        return "Select a valid program.";
    }

    if (
        ![
            "CS",
            "CS-AI",
            "CS-IT",
            "CS-DS",
            "CS-IOT",
            "EE",
            "ME",
            "CE"
        ].includes(data.branch)
    ) {
        return "Select a valid branch.";
    }

    const year = Number(data.yearOfAdmission);

    if (
        !Number.isInteger(year) ||
        year < 2000 ||
        year > 2030
    ) {
        return "Year Of Admission must be between 2000 and 2030.";
    }

    if (!sectionPattern.test(data.section)) {
        return "Section must be one capital letter from A to T.";
    }

    if (!pinPattern.test(data.password)) {
        return "Password must contain exactly 4 digits.";
    }

    if (data.password !== data.confirmPassword) {
        return "Passwords do not match.";
    }

    return null;
}


/* ---------- Cookie / Session Helpers ---------- */

function getSessionId(request) {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
        return null;
    }

    const cookies = {};

    cookieHeader.split(";").forEach((cookie) => {
        const [name, ...valueParts] = cookie.trim().split("=");

        cookies[name] = valueParts.join("=");
    });

    return cookies.sessionId || null;
}

function createSession(userId) {
    const sessionId = crypto.randomBytes(32).toString("hex");

    sessions.set(sessionId, userId);

    return sessionId;
}

function getAuthenticatedUser(request) {
    const sessionId = getSessionId(request);

    if (!sessionId) {
        return null;
    }

    const userId = sessions.get(sessionId);

    if (!userId) {
        return null;
    }

    const database = readDatabase();

    return database.users.find((user) => user.id === userId) || null;
}

function setSessionCookie(response, sessionId) {
    response.setHeader(
        "Set-Cookie",
        `sessionId=${sessionId}; HttpOnly; SameSite=Strict; Path=/`
    );
}

function clearSessionCookie(response) {
    response.setHeader(
        "Set-Cookie",
        "sessionId=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
    );
}


/* ---------- User Response ---------- */

/*
 * Never send the password hash to the browser.
 */
function getSafeUser(user) {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        program: user.program,
        branch: user.branch,
        yearOfAdmission: user.yearOfAdmission,
        section: user.section
    };
}


/* ---------- API Routes ---------- */

async function handleApiRequest(request, response) {
    const url = new URL(
        request.url,
        `http://${request.headers.host}`
    );

    /* ---------- Sign Up ---------- */

    if (request.method === "POST" && url.pathname === "/api/signup") {
        try {
            const data = await readRequestBody(request);

            /*
             * Normalize values before validation/storage.
             */
            data.firstName = String(data.firstName || "").toUpperCase();
            data.lastName = String(data.lastName || "").toUpperCase();
            data.email = String(data.email || "").trim().toLowerCase();
            data.phone = String(data.phone || "").trim();
            data.program = String(data.program || "");
            data.branch = String(data.branch || "");
            data.yearOfAdmission = String(
                data.yearOfAdmission || ""
            ).trim();
            data.section = String(data.section || "").toUpperCase();
            data.password = String(data.password || "");
            data.confirmPassword = String(
                data.confirmPassword || ""
            );

            const validationError = validateRegistration(data);

            if (validationError) {
                sendJson(response, 400, {
                    message: validationError
                });

                return;
            }

            const database = readDatabase();

            const emailExists = database.users.some(
                (user) => user.email === data.email
            );

            if (emailExists) {
                sendJson(response, 409, {
                    message: "An account with this email already exists."
                });

                return;
            }

            const user = {
                id: crypto.randomUUID(),
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                program: data.program,
                branch: data.branch,
                yearOfAdmission: Number(data.yearOfAdmission),
                section: data.section,
                passwordHash: hashPassword(data.password)
            };

            database.users.push(user);

            writeDatabase(database);

            sendJson(response, 201, {
                message: "Account created successfully."
            });

            return;

        } catch (error) {
            sendJson(response, 400, {
                message: "Invalid registration request."
            });

            return;
        }
    }


    /* ---------- Sign In ---------- */

    if (request.method === "POST" && url.pathname === "/api/signin") {
        try {
            const data = await readRequestBody(request);

            const email = String(data.email || "")
                .trim()
                .toLowerCase();

            const password = String(data.password || "");

            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
                !/^\d{4}$/.test(password)
            ) {
                sendJson(response, 400, {
                    message: "Enter a valid email and 4-digit password."
                });

                return;
            }

            const database = readDatabase();

            const user = database.users.find(
                (storedUser) => storedUser.email === email
            );

            if (!user) {
                sendJson(response, 401, {
                    message: "Invalid email or password."
                });

                return;
            }

            const passwordHash = hashPassword(password);

            if (passwordHash !== user.passwordHash) {
                sendJson(response, 401, {
                    message: "Invalid email or password."
                });

                return;
            }

            const sessionId = createSession(user.id);

            setSessionCookie(response, sessionId);

            sendJson(response, 200, {
                message: "Signed in successfully.",
                user: getSafeUser(user)
            });

            return;

        } catch (error) {
            sendJson(response, 400, {
                message: "Invalid sign-in request."
            });

            return;
        }
    }


    /* ---------- Check Session ---------- */

    if (request.method === "GET" && url.pathname === "/api/session") {
        const user = getAuthenticatedUser(request);

        if (!user) {
            sendJson(response, 401, {
                authenticated: false
            });

            return;
        }

        sendJson(response, 200, {
            authenticated: true,
            user: getSafeUser(user)
        });

        return;
    }


    /* ---------- Sign Out ---------- */

    if (request.method === "POST" && url.pathname === "/api/signout") {
        const sessionId = getSessionId(request);

        if (sessionId) {
            sessions.delete(sessionId);
        }

        clearSessionCookie(response);

        sendJson(response, 200, {
            message: "Signed out successfully."
        });

        return;
    }


    sendJson(response, 404, {
        message: "API endpoint not found."
    });
}


/* ---------- Static Files ---------- */

function serveStaticFile(request, response) {
    let requestedPath = request.url.split("?")[0];

    if (requestedPath === "/") {
        requestedPath = "/index.html";
    }

    /*
     * Only files inside public/ can be served.
     * This prevents database.json and server.js
     * from being directly requested by the browser.
     */
    const filePath = path.normalize(
        path.join(PUBLIC_DIRECTORY, requestedPath)
    );

    if (!filePath.startsWith(PUBLIC_DIRECTORY)) {
        response.writeHead(403);
        response.end("Forbidden");

        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(404);
            response.end("File not found.");

            return;
        }

        const extension = path.extname(filePath).toLowerCase();

        const contentTypes = {
            ".html": "text/html; charset=UTF-8",
            ".css": "text/css; charset=UTF-8",
            ".js": "application/javascript; charset=UTF-8",
            ".ico": "image/x-icon",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".svg": "image/svg+xml"
        };

        const contentType =
            contentTypes[extension] || "application/octet-stream";

        response.writeHead(200, {
            "Content-Type": contentType
        });

        response.end(data);
    });
}


/* ---------- HTTP Server ---------- */

const server = http.createServer(async (request, response) => {
    const url = new URL(
        request.url,
        `http://${request.headers.host}`
    );

    if (url.pathname.startsWith("/api/")) {
        await handleApiRequest(request, response);

        return;
    }

    if (request.method === "GET") {
        serveStaticFile(request, response);

        return;
    }

    response.writeHead(405);
    response.end("Method Not Allowed");
});


server.listen(PORT, () => {
    console.log(`DOPP Class Registration running at http://localhost:${PORT}`);
});