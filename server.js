/*
=========================================================
DOPP Class Registration
Node.js Backend Server
=========================================================
*/

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* ---------- Configuration ---------- */

const PORT = 3000;

const PUBLIC_DIRECTORY = path.join(__dirname, "public");
const DATABASE_FILE = path.join(__dirname, "database.json");

// Sessions are kept in memory for this simple academic project.
const sessions = new Map();

/* ---------- MIME Types ---------- */

const MIME_TYPES = {
    ".html": "text/html; charset=UTF-8",
    ".css": "text/css; charset=UTF-8",
    ".js": "application/javascript; charset=UTF-8",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
};

/* ---------- Database Helpers ---------- */

/*
 * Read the JSON database.
 *
 * If the file cannot be read or contains invalid JSON,
 * return an empty database structure instead of crashing
 * the server.
 */
function readDatabase() {
    try {
        const data = fs.readFileSync(DATABASE_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
}

/*
 * Save the current database to database.json.
 *
 * Pretty formatting makes the file easier to inspect
 * during the academic demonstration.
 */
function writeDatabase(database) {
    fs.writeFileSync(
        DATABASE_FILE,
        JSON.stringify(database, null, 2),
        "utf8"
    );
}

/* ---------- Password / Session Security ---------- */

/*
 * Hash the 4-digit password before storing or comparing it.
 *
 * The application never stores the password itself.
 */
function hashPassword(password) {
    return crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
}

/*
 * Generate a unique session identifier.
 */
function createSession(userId) {
    const sessionId = crypto.randomUUID();

    sessions.set(sessionId, userId);

    return sessionId;
}

/* ---------- Request Helpers ---------- */

/*
 * Send a JSON response to the browser.
 *
 * API responses are marked as no-store because they can
 * contain authentication/session-related information.
 */
function sendJson(response, statusCode, data, extraHeaders = {}) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "no-store",
        ...extraHeaders
    });

    response.end(JSON.stringify(data));
}

/*
 * Read and parse a JSON request body.
 *
 * The application only needs very small request bodies,
 * so a 10 KB limit is more than sufficient.
 */
function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        let rejected = false;

        request.on("data", (chunk) => {
            body += chunk.toString();

            // Prevent unnecessarily large request bodies.
            if (body.length > 10_000 && !rejected) {
                rejected = true;
                request.destroy();

                reject(new Error("Request body is too large."));
            }
        });

        request.on("end", () => {
            if (rejected) {
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error("Invalid JSON."));
            }
        });

        request.on("error", (error) => {
            if (!rejected) {
                reject(error);
            }
        });
    });
}

/* ---------- Validation ---------- */

/*
 * Validate all registration fields on the server.
 *
 * Frontend validation improves user experience, but backend
 * validation is still required because browser-side validation
 * can be bypassed.
 */
function validateRegistration(data) {
    const namePattern = /^[A-Z]{3,20}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10}$/;
    const sectionPattern = /^[A-T]$/;
    const pinPattern = /^\d{4}$/;

    const allowedPrograms = [
        "B.Tech",
        "M.Tech",
        "PHD"
    ];

    const allowedBranches = [
        "CS",
        "CS-AI",
        "CS-IT",
        "CS-DS",
        "CS-IOT",
        "EE",
        "ME",
        "CE"
    ];

    if (!namePattern.test(data.firstName)) {
        return "First Name must contain 3–20 capital letters only.";
    }

    if (!namePattern.test(data.lastName)) {
        return "Last Name must contain 3–20 capital letters only.";
    }

    if (!emailPattern.test(data.collegeEmail)) {
        return "Please enter a valid college email address.";
    }

    if (!phonePattern.test(data.phoneNumber)) {
        return "Phone Number must contain exactly 10 digits.";
    }

    if (!allowedPrograms.includes(data.program)) {
        return "Please select a valid Program.";
    }

    if (!allowedBranches.includes(data.branch)) {
        return "Please select a valid Branch.";
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
        return "Section must be a single capital letter from A to T.";
    }

    if (!pinPattern.test(data.createPassword)) {
        return "Password must be exactly 4 digits.";
    }

    if (data.createPassword !== data.confirmPassword) {
        return "Passwords do not match.";
    }

    return null;
}

/*
 * Validate the credentials supplied during sign in.
 */
function validateSignIn(collegeEmail, password) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pinPattern = /^\d{4}$/;

    return (
        emailPattern.test(collegeEmail) &&
        pinPattern.test(password)
    );
}

/* ---------- Cookie / Session Helpers ---------- */

/*
 * Extract the session ID from the request cookies.
 */
function getSessionId(request) {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
        return null;
    }

    const cookies = {};

    cookieHeader.split(";").forEach((cookie) => {
        const [name, ...valueParts] = cookie.trim().split("=");

        if (!name) {
            return;
        }

        cookies[name] = decodeURIComponent(valueParts.join("="));
    });

    return cookies.sessionId || null;
}

/*
 * Attach a secure session cookie to the response.
 *
 * HttpOnly prevents JavaScript from directly reading the cookie.
 * SameSite=Strict reduces cross-site request risks.
 */
function setSessionCookie(response, sessionId) {
    response.setHeader(
        "Set-Cookie",
        `sessionId=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Strict; Path=/`
    );
}

/*
 * Expire the session cookie when the user signs out.
 */
function clearSessionCookie(response) {
    response.setHeader(
        "Set-Cookie",
        "sessionId=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
    );
}

/*
 * Find the currently authenticated user using the session cookie.
 */
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

    return (
        database.users.find((user) => user.id === userId) ||
        null
    );
}

/* ---------- Safe User Response ---------- */

/*
 * Never send passwordHash to the browser.
 *
 * Only fields required by the main page are returned.
 */
function getSafeUser(user) {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        collegeEmail: user.collegeEmail,
        phoneNumber: user.phoneNumber,
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
        `http://${request.headers.host || "localhost"}`
    );

    /* ---------- Sign Up ---------- */

    if (
        request.method === "POST" &&
        url.pathname === "/api/signup"
    ) {
        try {
            const data = await readRequestBody(request);

            /*
             * Ensure the request contains a JSON object.
             */
            if (
                !data ||
                typeof data !== "object" ||
                Array.isArray(data)
            ) {
                sendJson(response, 400, {
                    success: false,
                    message: "Invalid registration request."
                });

                return;
            }

            /*
             * Normalize values before validation/storage.
             *
             * Names and section are converted to uppercase.
             * Email is converted to lowercase.
             *
             * Other fields are NOT silently stripped of invalid
             * characters because backend validation should reject
             * invalid input rather than hide it.
             */
            const registrationData = {
                firstName: String(data.firstName || "")
                    .trim()
                    .toUpperCase(),

                lastName: String(data.lastName || "")
                    .trim()
                    .toUpperCase(),

                collegeEmail: String(data.collegeEmail || "")
                    .trim()
                    .toLowerCase(),

                phoneNumber: String(data.phoneNumber || "")
                    .trim(),

                program: String(data.program || "").trim(),

                branch: String(data.branch || "").trim(),

                yearOfAdmission: String(
                    data.yearOfAdmission || ""
                ).trim(),

                section: String(data.section || "")
                    .trim()
                    .toUpperCase(),

                createPassword: String(
                    data.createPassword || ""
                ),

                confirmPassword: String(
                    data.confirmPassword || ""
                )
            };

            const validationError =
                validateRegistration(registrationData);

            if (validationError) {
                sendJson(response, 400, {
                    success: false,
                    message: validationError
                });

                return;
            }

            const database = readDatabase();

            /*
             * Prevent duplicate accounts using the normalized
             * lowercase college email.
             */
            const emailExists = database.users.some(
                (user) =>
                    user.collegeEmail ===
                    registrationData.collegeEmail
            );

            if (emailExists) {
                sendJson(response, 409, {
                    success: false,
                    message:
                        "An account with this college email already exists."
                });

                return;
            }

            /*
             * Store only the password hash, never the password itself.
             */
            const user = {
                id: crypto.randomUUID(),
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                collegeEmail: registrationData.collegeEmail,
                phoneNumber: registrationData.phoneNumber,
                program: registrationData.program,
                branch: registrationData.branch,
                yearOfAdmission: Number(
                    registrationData.yearOfAdmission
                ),
                section: registrationData.section,
                passwordHash: hashPassword(
                    registrationData.createPassword
                )
            };

            database.users.push(user);
            writeDatabase(database);

            sendJson(response, 201, {
                success: true,
                message: "Account created successfully."
            });

            return;
        } catch (error) {
            sendJson(response, 400, {
                success: false,
                message: "Invalid registration request."
            });

            return;
        }
    }

    /* ---------- Sign In ---------- */

    if (
        request.method === "POST" &&
        url.pathname === "/api/signin"
    ) {
        try {
            const data = await readRequestBody(request);

            if (
                !data ||
                typeof data !== "object" ||
                Array.isArray(data)
            ) {
                sendJson(response, 400, {
                    success: false,
                    message: "Invalid sign-in request."
                });

                return;
            }

            const collegeEmail = String(
                data.collegeEmail || ""
            )
                .trim()
                .toLowerCase();

            const password = String(data.password || "");

            /*
             * Reject obviously invalid credentials before checking
             * the database.
             */
            if (!validateSignIn(collegeEmail, password)) {
                sendJson(response, 400, {
                    success: false,
                    message:
                        "Enter a valid email and 4-digit password."
                });

                return;
            }

            const database = readDatabase();

            const user = database.users.find(
                (storedUser) =>
                    storedUser.collegeEmail === collegeEmail
            );

            /*
             * Use the same generic message for unknown email and
             * incorrect password.
             */
            if (
                !user ||
                user.passwordHash !== hashPassword(password)
            ) {
                sendJson(response, 401, {
                    success: false,
                    message:
                        "Invalid college email or password."
                });

                return;
            }

            const sessionId = createSession(user.id);

            setSessionCookie(response, sessionId);

            sendJson(response, 200, {
                success: true,
                message: "Signed in successfully.",
                user: getSafeUser(user)
            });

            return;
        } catch (error) {
            sendJson(response, 400, {
                success: false,
                message: "Invalid sign-in request."
            });

            return;
        }
    }

    /* ---------- Check Current Session ---------- */

    if (
        request.method === "GET" &&
        url.pathname === "/api/session"
    ) {
        const user = getAuthenticatedUser(request);

        if (!user) {
            sendJson(response, 401, {
                success: false,
                authenticated: false
            });

            return;
        }

        sendJson(response, 200, {
            success: true,
            authenticated: true,
            user: getSafeUser(user)
        });

        return;
    }

    /* ---------- Sign Out ---------- */

    if (
        request.method === "POST" &&
        url.pathname === "/api/signout"
    ) {
        const sessionId = getSessionId(request);

        if (sessionId) {
            sessions.delete(sessionId);
        }

        clearSessionCookie(response);

        sendJson(response, 200, {
            success: true,
            message: "Signed out successfully."
        });

        return;
    }

    sendJson(response, 404, {
        success: false,
        message: "API endpoint not found."
    });
}

/* ---------- Static File Serving ---------- */

function serveStaticFile(request, response) {
    let requestedPath = request.url.split("?")[0];

    if (requestedPath === "/") {
        requestedPath = "/index.html";
    }

    /*
     * Resolve the requested path against public/.
     *
     * This prevents requests such as:
     * /../database.json
     * /../server.js
     *
     * from escaping the public directory.
     */
    const filePath = path.resolve(
        PUBLIC_DIRECTORY,
        "." + requestedPath
    );

    if (
        filePath !== PUBLIC_DIRECTORY &&
        !filePath.startsWith(
            PUBLIC_DIRECTORY + path.sep
        )
    ) {
        response.writeHead(403, {
            "Content-Type": "text/plain; charset=UTF-8"
        });

        response.end("Forbidden");

        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(404, {
                "Content-Type": "text/plain; charset=UTF-8"
            });

            response.end("File not found.");

            return;
        }

        const extension = path.extname(filePath).toLowerCase();

        const contentType =
            MIME_TYPES[extension] ||
            "application/octet-stream";

        response.writeHead(200, {
            "Content-Type": contentType
        });

        response.end(data);
    });
}

/* ---------- HTTP Server ---------- */

const server = http.createServer(
    async (request, response) => {
        const url = new URL(
            request.url,
            `http://${request.headers.host || "localhost"}`
        );

        /*
         * API requests are handled separately from static files.
         */
        if (url.pathname.startsWith("/api/")) {
            await handleApiRequest(request, response);
            return;
        }

        /*
         * Only GET requests are allowed for static files.
         */
        if (request.method === "GET") {
            serveStaticFile(request, response);
            return;
        }

        response.writeHead(405, {
            "Content-Type": "text/plain; charset=UTF-8"
        });

        response.end("Method Not Allowed");
    }
);

/* ---------- Server Startup ---------- */

/*
 * Start the server only when this file is executed directly.
 *
 * This is important for automated testing:
 *
 *     node server.js
 *
 * starts the application normally, while:
 *
 *     require("./server")
 *
 * allows test.js to use exported functions without starting
 * another HTTP server.
 */
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(
            `DOPP Class Registration running at http://localhost:${PORT}`
        );
    });
}

/* ---------- Exports for Automated Testing ---------- */

/*
 * Export only the functions required by the test suite.
 */
module.exports = {
    server,
    validateRegistration,
    validateSignIn,
    hashPassword,
    getSafeUser
};