const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validateRegistration,
    validateSignIn,
    hashPassword,
    getSafeUser
} = require("./server");

/*
=========================================================
DOPP Class Registration
Automated Backend Tests
=========================================================
*/

/* ---------- Valid Registration Data ---------- */

const validRegistration = {
    firstName: "RAHUL",
    lastName: "SHARMA",
    collegeEmail: "rahul.sharma@college.edu",
    phoneNumber: "9876543210",
    program: "B.Tech",
    branch: "CS",
    yearOfAdmission: "2024",
    section: "A",
    createPassword: "1234",
    confirmPassword: "1234"
};

/* ---------- Registration Validation Tests ---------- */

test("valid registration data should pass validation", () => {
    assert.equal(
        validateRegistration(validRegistration),
        null
    );
});

test("first name must contain 3-20 capital letters", () => {
    const data = {
        ...validRegistration,
        firstName: "Ra"
    };

    assert.match(
        validateRegistration(data),
        /First Name/
    );
});

test("last name must contain 3-20 capital letters", () => {
    const data = {
        ...validRegistration,
        lastName: "sharma"
    };

    assert.match(
        validateRegistration(data),
        /Last Name/
    );
});

test("college email must have a valid basic format", () => {
    const data = {
        ...validRegistration,
        collegeEmail: "invalid-email"
    };

    assert.match(
        validateRegistration(data),
        /email/i
    );
});

test("phone number must contain exactly 10 digits", () => {
    const data = {
        ...validRegistration,
        phoneNumber: "987654321"
    };

    assert.match(
        validateRegistration(data),
        /Phone Number/
    );
});

test("program must be one of the allowed values", () => {
    const data = {
        ...validRegistration,
        program: "BCA"
    };

    assert.match(
        validateRegistration(data),
        /Program/
    );
});

test("branch must be one of the allowed values", () => {
    const data = {
        ...validRegistration,
        branch: "IT"
    };

    assert.match(
        validateRegistration(data),
        /Branch/
    );
});

test("year of admission must be between 2000 and 2030", () => {
    const data = {
        ...validRegistration,
        yearOfAdmission: "1999"
    };

    assert.match(
        validateRegistration(data),
        /Year Of Admission/
    );
});

test("section must be a single capital letter from A to T", () => {
    const data = {
        ...validRegistration,
        section: "U"
    };

    assert.match(
        validateRegistration(data),
        /Section/
    );
});

test("password must contain exactly 4 digits", () => {
    const data = {
        ...validRegistration,
        createPassword: "12345",
        confirmPassword: "12345"
    };

    assert.match(
        validateRegistration(data),
        /Password/
    );
});

test("password and confirm password must match", () => {
    const data = {
        ...validRegistration,
        createPassword: "1234",
        confirmPassword: "5678"
    };

    assert.match(
        validateRegistration(data),
        /Passwords do not match/
    );
});

/* ---------- Sign-In Validation Tests ---------- */

test("valid sign-in credentials format should pass validation", () => {
    assert.equal(
        validateSignIn(
            "rahul.sharma@college.edu",
            "1234"
        ),
        true
    );
});

test("invalid sign-in email should fail validation", () => {
    assert.equal(
        validateSignIn(
            "invalid-email",
            "1234"
        ),
        false
    );
});

test("invalid sign-in password should fail validation", () => {
    assert.equal(
        validateSignIn(
            "rahul.sharma@college.edu",
            "12345"
        ),
        false
    );
});

/* ---------- Password Hashing Tests ---------- */

test("password hash should not equal the original password", () => {
    const password = "1234";
    const hashedPassword = hashPassword(password);

    assert.notEqual(
        hashedPassword,
        password
    );
});

test("same password should produce the same hash", () => {
    assert.equal(
        hashPassword("1234"),
        hashPassword("1234")
    );
});

test("different passwords should produce different hashes", () => {
    assert.notEqual(
        hashPassword("1234"),
        hashPassword("5678")
    );
});

/* ---------- Safe User Response Tests ---------- */

test("safe user data should never expose passwordHash", () => {
    const user = {
        id: "test-user-id",
        firstName: "RAHUL",
        lastName: "SHARMA",
        collegeEmail: "rahul.sharma@college.edu",
        phoneNumber: "9876543210",
        program: "B.Tech",
        branch: "CS",
        yearOfAdmission: 2024,
        section: "A",
        passwordHash: hashPassword("1234")
    };

    const safeUser = getSafeUser(user);

    assert.equal(
        safeUser.passwordHash,
        undefined
    );

    assert.equal(
        safeUser.collegeEmail,
        user.collegeEmail
    );

    assert.equal(
        safeUser.firstName,
        user.firstName
    );
});