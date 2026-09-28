/* =========================================================
   DOPP Class Registration
   Frontend JavaScript
   ========================================================= */

const signInPage = document.getElementById("signInPage");
const signUpPage = document.getElementById("signUpPage");
const mainPage = document.getElementById("mainPage");

const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");

const showSignUpButton = document.getElementById("showSignUpButton");
const showSignInButton = document.getElementById("showSignInButton");
const signOutButton = document.getElementById("signOutButton");

const themeButton = document.getElementById("themeButton");

const signInMessage = document.getElementById("signInMessage");
const signUpMessage = document.getElementById("signUpMessage");


/* ---------- Theme ---------- */

function applyTheme(theme) {
    document.body.classList.toggle("dark-theme", theme === "dark");

    themeButton.textContent = theme === "dark" ? "☀️" : "🌙";
}

function loadTheme() {
    const savedTheme = localStorage.getItem("doppTheme");

    if (savedTheme === "dark" || savedTheme === "light") {
        applyTheme(savedTheme);
        return;
    }

    applyTheme("light");
}

themeButton.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-theme");
    const newTheme = isDark ? "light" : "dark";

    localStorage.setItem("doppTheme", newTheme);
    applyTheme(newTheme);
});


/* ---------- Page Switching ---------- */

function showPage(page) {
    signInPage.classList.add("hidden");
    signUpPage.classList.add("hidden");
    mainPage.classList.add("hidden");

    page.classList.remove("hidden");
}

showSignUpButton.addEventListener("click", () => {
    clearMessages();
    showPage(signUpPage);
});

showSignInButton.addEventListener("click", () => {
    clearMessages();
    showPage(signInPage);
});


/* ---------- Utility Functions ---------- */

function setMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
}

function clearMessages() {
    signInMessage.textContent = "";
    signUpMessage.textContent = "";

    signInMessage.className = "message";
    signUpMessage.className = "message";
}

function setFieldMessage(elementId, message, isValid) {
    const element = document.getElementById(elementId);

    element.textContent = isValid
        ? "✅ Valid"
        : `❌ ${message}`;

    element.className = isValid
        ? "field-message success"
        : "field-message error";
}


/* ---------- Constraint Hover Display ---------- */

const constraintTimers = new WeakMap();

document.querySelectorAll(".form-group").forEach((group) => {
    const field = group.querySelector("input, select");
    const constraint = group.querySelector(".constraint");

    if (!field || !constraint) {
        return;
    }

    field.addEventListener("mouseenter", () => {
        constraint.classList.add("visible");

        const existingTimer = constraintTimers.get(constraint);

        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
            constraint.classList.remove("visible");
        }, 5000);

        constraintTimers.set(constraint, timer);
    });

    field.addEventListener("mouseleave", () => {
        /*
         * The constraint stays visible until the five-second
         * timer finishes, even after leaving the field.
         */
    });
});


/* ---------- Validation Functions ---------- */

function validateName(value) {
    return /^[A-Z]{3,20}$/.test(value);
}

function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
    return /^\d{10}$/.test(value);
}

function validateYear(value) {
    const year = Number(value);

    return Number.isInteger(year) && year >= 2000 && year <= 2030;
}

function validateSection(value) {
    return /^[A-T]$/.test(value);
}

function validatePin(value) {
    return /^\d{4}$/.test(value);
}


/* ---------- Sign Up Field Validation ---------- */

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const collegeEmailInput = document.getElementById("collegeEmail");
const phoneNumberInput = document.getElementById("phoneNumber");
const programInput = document.getElementById("program");
const branchInput = document.getElementById("branch");
const yearInput = document.getElementById("yearOfAdmission");
const sectionInput = document.getElementById("section");
const createPasswordInput = document.getElementById("createPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");


firstNameInput.addEventListener("input", () => {
    firstNameInput.value = firstNameInput.value.toUpperCase();

    const valid = validateName(firstNameInput.value);

    setFieldMessage(
        "firstNameMessage",
        "Use 3–20 capital letters only.",
        valid
    );
});


lastNameInput.addEventListener("input", () => {
    lastNameInput.value = lastNameInput.value.toUpperCase();

    const valid = validateName(lastNameInput.value);

    setFieldMessage(
        "lastNameMessage",
        "Use 3–20 capital letters only.",
        valid
    );
});


collegeEmailInput.addEventListener("input", () => {
    collegeEmailInput.value = collegeEmailInput.value.toLowerCase();

    const valid = validateEmail(collegeEmailInput.value);

    setFieldMessage(
        "collegeEmailMessage",
        "Enter a valid email address.",
        valid
    );
});


phoneNumberInput.addEventListener("input", () => {
    phoneNumberInput.value = phoneNumberInput.value
        .replace(/\D/g, "")
        .slice(0, 10);

    const valid = validatePhone(phoneNumberInput.value);

    setFieldMessage(
        "phoneNumberMessage",
        "Phone number must contain exactly 10 digits.",
        valid
    );
});


programInput.addEventListener("change", () => {
    const valid = programInput.value !== "";

    setFieldMessage(
        "programMessage",
        "Select a valid program.",
        valid
    );
});


branchInput.addEventListener("change", () => {
    const valid = branchInput.value !== "";

    setFieldMessage(
        "branchMessage",
        "Select a valid branch.",
        valid
    );
});


yearInput.addEventListener("input", () => {
    yearInput.value = yearInput.value.replace(/\D/g, "");

    const valid = validateYear(yearInput.value);

    setFieldMessage(
        "yearOfAdmissionMessage",
        "Year must be between 2000 and 2030.",
        valid
    );
});


sectionInput.addEventListener("input", () => {
    sectionInput.value = sectionInput.value
        .toUpperCase()
        .replace(/[^A-T]/g, "")
        .slice(0, 1);

    const valid = validateSection(sectionInput.value);

    setFieldMessage(
        "sectionMessage",
        "Section must be one capital letter from A to T.",
        valid
    );
});


createPasswordInput.addEventListener("input", () => {
    createPasswordInput.value = createPasswordInput.value
        .replace(/\D/g, "")
        .slice(0, 4);

    const valid = validatePin(createPasswordInput.value);

    setFieldMessage(
        "createPasswordMessage",
        "Password must contain exactly 4 digits.",
        valid
    );

    validateConfirmPassword();
});


confirmPasswordInput.addEventListener("input", validateConfirmPassword);

function validateConfirmPassword() {
    const valid =
        validatePin(confirmPasswordInput.value) &&
        confirmPasswordInput.value === createPasswordInput.value;

    setFieldMessage(
        "confirmPasswordMessage",
        "Passwords must match and contain exactly 4 digits.",
        valid
    );
}


/* ---------- Sign Up ---------- */

signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        email: collegeEmailInput.value,
        phone: phoneNumberInput.value,
        program: programInput.value,
        branch: branchInput.value,
        yearOfAdmission: yearInput.value,
        section: sectionInput.value,
        password: createPasswordInput.value,
        confirmPassword: confirmPasswordInput.value
    };

    const allValid =
        validateName(formData.firstName) &&
        validateName(formData.lastName) &&
        validateEmail(formData.email) &&
        validatePhone(formData.phone) &&
        formData.program !== "" &&
        formData.branch !== "" &&
        validateYear(formData.yearOfAdmission) &&
        validateSection(formData.section) &&
        validatePin(formData.password) &&
        formData.password === formData.confirmPassword;

    if (!allValid) {
        setMessage(
            signUpMessage,
            "❌ Please correct all invalid fields before submitting.",
            "error"
        );

        return;
    }

    try {
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            setMessage(
                signUpMessage,
                `❌ ${result.message}`,
                "error"
            );

            return;
        }

        setMessage(
            signUpMessage,
            "✅ Account created successfully. You can now sign in.",
            "success"
        );

        signUpForm.reset();

        setTimeout(() => {
            clearMessages();
            showPage(signInPage);
        }, 1200);

    } catch (error) {
        setMessage(
            signUpMessage,
            "❌ Unable to connect to the server.",
            "error"
        );
    }
});


/* ---------- Sign In ---------- */

signInForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document
        .getElementById("signInEmail")
        .value
        .trim()
        .toLowerCase();

    const password = document.getElementById("signInPassword").value;

    if (!validateEmail(email)) {
        setMessage(
            signInMessage,
            "❌ Enter a valid email address.",
            "error"
        );

        return;
    }

    if (!validatePin(password)) {
        setMessage(
            signInMessage,
            "❌ Password must contain exactly 4 digits.",
            "error"
        );

        return;
    }

    try {
        const response = await fetch("/api/signin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            setMessage(
                signInMessage,
                `❌ ${result.message}`,
                "error"
            );

            return;
        }

        signInForm.reset();
        clearMessages();

        showMainPage(result.user);

    } catch (error) {
        setMessage(
            signInMessage,
            "❌ Unable to connect to the server.",
            "error"
        );
    }
});


/* ---------- Main Page ---------- */

function showMainPage(user) {
    document.getElementById("displayFirstName").textContent =
        user.firstName;

    document.getElementById("displayLastName").textContent =
        user.lastName;

    document.getElementById("displayEmail").textContent =
        user.email;

    document.getElementById("displayPhone").textContent =
        user.phone;

    document.getElementById("displayProgram").textContent =
        user.program;

    document.getElementById("displayBranch").textContent =
        user.branch;

    document.getElementById("displayYear").textContent =
        user.yearOfAdmission;

    document.getElementById("displaySection").textContent =
        user.section;

    showPage(mainPage);
}


/* ---------- Session Check ---------- */

async function checkSession() {
    try {
        const response = await fetch("/api/session");

        const result = await response.json();

        if (response.ok && result.authenticated) {
            showMainPage(result.user);
        } else {
            showPage(signInPage);
        }
    } catch (error) {
        showPage(signInPage);
    }
}


/* ---------- Sign Out ---------- */

signOutButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/api/signout", {
            method: "POST"
        });

        if (response.ok) {
            clearMessages();
            showPage(signInPage);
        } else {
            alert("Unable to sign out. Please try again.");
        }
    } catch (error) {
        alert("Unable to connect to the server.");
    }
});


/* ---------- Application Startup ---------- */

loadTheme();
checkSession();