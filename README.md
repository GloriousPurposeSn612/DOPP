# DOPP Class Registration

A simple Semester 5 **DevOps Practices & Principles (DOPP)** class registration web application built using HTML, CSS, JavaScript, Node.js, a JSON database, Git/GitHub, and Jenkins.

The project is intentionally kept simple and is designed to demonstrate fundamental **Version Control, Continuous Integration (CI), Automated Testing, Jenkins Jobs, Jenkins Pipelines, Pipeline as Code, and Build Automation** concepts.

---

## 1. Project Overview

The application provides a basic registration and authentication system for students joining the Semester 5 DOPP class.

### Main application features

- Sign In page
- Sign Up / Registration page
- Student registration form
- Client-side input validation
- Server-side input validation
- Simple JSON database
- Password hashing
- Session-based authentication
- Secure sign out
- Persistent application data across refreshes
- Dark/Bright theme
- Responsive and clean user interface
- Student details displayed after sign in
- Custom favicon

### DevOps features demonstrated

- Git version control
- GitHub repository
- Meaningful Git commits
- `.gitignore`
- Automated backend tests
- Jenkins Freestyle Job
- Jenkins manual builds
- Jenkins Git/SCM checkout
- Jenkins build steps
- JavaScript syntax verification
- Automated test execution
- Jenkins Pipeline
- Jenkinsfile
- Pipeline as Code
- Jenkins Pipeline stages
- SCM polling trigger

The project is deliberately not over-engineered because it is intended as a basic academic project and will later be used to demonstrate Docker, Kubernetes, and other DevOps concepts.

---

## 2. Technology Stack

| Technology              | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| HTML5                   | Web page structure                          |
| CSS3                    | Styling and UI                              |
| JavaScript              | Frontend behaviour and validation           |
| Node.js                 | Backend server                              |
| Node.js `http` module   | HTTP server and API handling                |
| Node.js `fs` module     | JSON database file operations               |
| Node.js `crypto` module | Password hashing and session IDs            |
| JSON                    | Simple database storage                     |
| Git                     | Version control                             |
| GitHub                  | Remote source-code repository               |
| Node.js Test Runner     | Automated backend testing                   |
| Jenkins                 | Continuous Integration and build automation |

No frontend framework or backend framework is used.

The application uses Node.js built-in modules to keep the implementation simple and transparent.

---

## 3. Project Structure

The project currently follows a simple structure:

```text
DOPP/
│
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── favicon.*
│
├── database.json
├── server.js
├── test.js
├── package.json
├── Jenkinsfile
├── .gitignore
└── README.md
```

> The exact favicon filename/extension depends on the favicon implementation used in the project.

### File responsibilities

| File / Directory | Purpose                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| `public/`        | Frontend files served to the browser                                       |
| `index.html`     | Main HTML structure                                                        |
| `style.css`      | Application styling and theme styles                                       |
| `script.js`      | Frontend behaviour, validation, authentication UI and theme handling       |
| `favicon.*`      | Browser tab icon                                                           |
| `server.js`      | Node.js backend server, API routes, authentication and static-file serving |
| `database.json`  | Simple JSON-based user database                                            |
| `test.js`        | Automated backend tests                                                    |
| `package.json`   | Project metadata and npm scripts                                           |
| `Jenkinsfile`    | Jenkins Pipeline definition                                                |
| `.gitignore`     | Prevents selected local/generated files from being committed               |
| `README.md`      | Project and DevOps documentation                                           |

---

## 4. Application Architecture

The application uses a simple browser → Node.js server → JSON database architecture.

```text
                 Browser
                    │
                    │ HTTP requests
                    ▼
          ┌─────────────────────┐
          │     Node.js Server  │
          │      server.js      │
          └──────────┬──────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     Static Files           REST-like API
      public/               /api/...
                                │
                                ▼
                         database.json
```

The browser never directly accesses `database.json`.

The Node.js server is responsible for:

- serving frontend files
- receiving registration requests
- validating submitted data
- storing registered users
- authenticating users
- creating sessions
- checking sessions
- signing users out
- returning safe user information

---

## 5. Registration Requirements

The registration form validates the following information.

| Field             | Requirement                                                 |
| ----------------- | ----------------------------------------------------------- |
| First Name        | 3–20 capital letters only                                   |
| Last Name         | 3–20 capital letters only                                   |
| College Email     | Basic email format                                          |
| Phone Number      | Exactly 10 digits                                           |
| Program           | `B.Tech`, `M.Tech`, `PHD`                                   |
| Branch            | `CS`, `CS-AI`, `CS-IT`, `CS-DS`, `CS-IOT`, `EE`, `ME`, `CE` |
| Year of Admission | 2000–2030                                                   |
| Section           | One capital letter from A–T                                 |
| Create Password   | Exactly 4 digits                                            |
| Confirm Password  | Must match Create Password                                  |

Additional behaviour:

- First and last names are normalized to uppercase.
- Email addresses are normalized to lowercase.
- Password fields use hidden/masked input.
- Validation messages are shown beside/below fields.
- Valid fields display a green confirmation indicator.
- Invalid fields display a red constraint message.
- Registration constraints are displayed through the application's hover/help behaviour.

Server-side validation repeats the important registration constraints so that validation is not dependent only on browser-side JavaScript.

---

## 6. Authentication

The application implements a simple session-based authentication system.

### Sign In flow

```text
User enters email + PIN
          │
          ▼
     POST /api/signin
          │
          ▼
Validate input
          │
          ▼
Find user in database
          │
          ▼
Compare password hash
          │
       ┌──┴──┐
       │     │
     Match  Fail
       │     │
       ▼     ▼
 Create   401 response
 session
       │
       ▼
 HttpOnly cookie
       │
       ▼
   Main page
```

### Sign Out flow

```text
User clicks Sign Out
        │
        ▼
POST /api/signout
        │
        ▼
Delete server-side session
        │
        ▼
Clear session cookie
        │
        ▼
Return to Sign In page
```

The password itself is not stored in the database.

A SHA-256 hash is stored instead.

The password hash is also never included in the safe user object returned to the browser.

> This is appropriate for demonstrating basic security concepts in this academic project. It is not intended to represent a production-grade authentication system.

---

## 7. Backend API

The Node.js server provides the following basic API routes.

| Method | Route          | Purpose                          |
| ------ | -------------- | -------------------------------- |
| `POST` | `/api/signup`  | Create a new account             |
| `POST` | `/api/signin`  | Authenticate an existing account |
| `GET`  | `/api/session` | Check the current session        |
| `POST` | `/api/signout` | Sign out the current user        |

The backend also serves the static frontend files from `public/`.

Only files inside `public/` are made available through static-file serving. This prevents files such as `database.json` and `server.js` from being directly served to the browser.

---

## 8. JSON Database

The project uses a simple JSON file instead of a database server.

The database is:

```text
database.json
```

Its general structure is:

```json
{
  "users": [
    {
      "id": "...",
      "firstName": "STUDENT",
      "lastName": "NAME",
      "email": "student@example.com",
      "phone": "9876543210",
      "program": "B.Tech",
      "branch": "CS",
      "yearOfAdmission": 2024,
      "section": "A",
      "passwordHash": "..."
    }
  ]
}
```

The actual password is not stored.

For this academic project, JSON was selected because it keeps the database layer simple and easy to understand.

A production application would normally use a proper database system.

---

## 9. Local Application Setup

### Prerequisites

Install:

- Node.js
- npm
- Git

Verify Node.js:

```powershell
node --version
```

Verify npm:

```powershell
npm --version
```

Verify Git:

```powershell
git --version
```

---

## 10. Running the Application Locally

Open PowerShell in the project directory.

Example:

```powershell
cd "E:\Shabd\Academics\Semester 5\DOPP"
```

Start the server:

```powershell
node server.js
```

The server runs on:

```text
http://localhost:3000
```

Open that address in a browser.

The application starts at the Sign In page.

---

## 11. Running Automated Tests

The project uses the built-in Node.js test runner.

The `package.json` test script is:

```json
"test": "node --test"
```

Run:

```powershell
npm test
```

The test suite currently verifies:

- valid registration data
- first name validation
- last name validation
- email validation
- phone validation
- program validation
- branch validation
- admission-year validation
- section validation
- password validation
- password confirmation
- sign-in input validation
- password hashing
- deterministic hashing behaviour
- different password hashes
- safe user responses without password hashes

The successful local test result was:

```text
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

Therefore:

```text
18 tests
18 passed
0 failed
```

---

## 12. JavaScript Syntax Verification

Before Jenkins was configured, the main JavaScript files were independently checked using Node.js:

```powershell
node --check server.js
node --check test.js
node --check public/script.js
```

A successful syntax check produces no error output and returns a successful exit status.

These checks were later included in the Jenkins CI process.

---

## 13. Git Version Control

Git is used to track project development.

Typical commands used during development:

```powershell
git status
git add <file>
git commit -m "commit message"
git push origin main
```

The project uses meaningful commit messages describing the change.

Example commits included work such as:

```text
Added test.js for running backend validation tests.
```

The repository's `main` branch is used by Jenkins for CI.

---

## 14. `.gitignore`

The project uses a Node-oriented `.gitignore`.

The local database file can be excluded from version control:

```text
database.json
```

This prevents locally stored registration data from being unintentionally committed.

The exact `.gitignore` contents should remain appropriate for the project's local development environment.

Files required for the application and CI process, such as:

```text
server.js
test.js
package.json
Jenkinsfile
public/
```

should remain tracked.

---

## 15. Jenkins Setup

Jenkins is installed locally and runs on:

```text
http://localhost:8080
```

Jenkins was started on Windows using:

```powershell
E:
cd E:\Jenkins
java -jar jenkins.war
```

The Java installation used for the Jenkins environment is based on JDK 25.

The project was tested with the following relevant tool versions during CI setup:

```text
Node.js : v24.15.0
npm     : 11.12.1
Git     : 2.52.0.windows.1
JDK     : 25
```

> Version numbers are environment-specific and may change if the development tools are upgraded.

---

## 16. Jenkins Continuous Integration Flow

The CI workflow developed for this project is:

```text
             GitHub Repository
                    │
                    │ Checkout
                    ▼
             ┌───────────────┐
             │    Jenkins    │
             └───────┬───────┘
                     │
                     ▼
              Environment Check
                     │
                     ▼
               Syntax Check
                     │
                     ▼
             Automated Tests
                     │
               ┌─────┴─────┐
               │           │
             PASS         FAIL
               │           │
               ▼           ▼
           SUCCESS       FAILURE
```

This demonstrates the basic Continuous Integration principle:

> Changes committed to the source repository can be automatically checked by a CI server.

---

## 17. Jenkins Freestyle Job

The first Jenkins implementation used a **Freestyle Project**.

Job name:

```text
DOPP-Class-Registration-CI
```

### Configuration

#### Source Code Management

```text
SCM       : Git
Repository: GitHub repository
Branch    : */main
```

No Jenkins credentials were required because the repository was accessible without authentication.

#### Build Step

The job uses:

```text
Execute Windows batch command
```

The CI build commands are:

```bat
@echo off

echo ==============================
echo DOPP CI BUILD
echo ==============================

echo.
echo Checking Node.js...
node --version

echo.
echo Checking npm...
call npm --version

echo.
echo Checking Java...
java -version

echo.
echo Running syntax checks...
node --check server.js
node --check test.js
node --check public\script.js

echo.
echo Running automated tests...
call npm test

echo.
echo ==============================
echo DOPP CI BUILD COMPLETED
echo ==============================
```

#### Important Windows batch detail

`npm` runs through a Windows command script.

Therefore:

```bat
call npm --version
call npm test
```

is used instead of:

```bat
npm --version
npm test
```

Without `call`, execution of the nested batch script can prevent the remaining commands in the Jenkins batch script from executing.

This was encountered during the first Jenkins build and corrected before the final successful CI build.

---

## 18. Jenkins Freestyle Build Result

The first Freestyle build successfully demonstrated:

```text
Git repository checkout
        ↓
Node.js detected
        ↓
npm detected
        ↓
Jenkins build completed successfully
```

The initial build output showed:

```text
git version 2.52.0.windows.1
```

and:

```text
Node.js
v24.15.0

npm
11.12.1
```

After correcting the Windows batch-script handling of `npm`, the complete CI build successfully executed:

```text
Node.js check
npm check
Java check
JavaScript syntax checks
Automated tests
```

with all automated tests passing.

---

## 19. Jenkins Pipeline

After validating the Freestyle workflow, a Pipeline job was created.

Pipeline job name:

```text
DOPP-Class-Registration-Pipeline
```

The Pipeline uses:

```text
Definition:
Pipeline script from SCM
```

SCM:

```text
Git
```

Branch:

```text
*/main
```

Script Path:

```text
Jenkinsfile
```

This means Jenkins retrieves the Pipeline definition directly from the Git repository.

---

## 20. Jenkinsfile

The project stores its Jenkins Pipeline definition in:

```text
Jenkinsfile
```

The Pipeline is divided into three simple stages:

```text
Environment
     ↓
Syntax Check
     ↓
Automated Tests
```

The purpose of each stage is:

### Environment

Checks the basic CI environment:

```text
Node.js
npm
Java
```

### Syntax Check

Checks:

```text
server.js
test.js
public/script.js
```

using Node.js syntax checking.

### Automated Tests

Runs:

```powershell
npm test
```

and therefore executes the project's automated test suite.

---

## 21. Pipeline as Code

The Jenkinsfile is committed to Git rather than being maintained only inside the Jenkins dashboard.

Therefore:

```text
Git Repository
      │
      ├── Application Code
      ├── Tests
      └── Jenkinsfile
             │
             ▼
          Jenkins
             │
             ▼
        Pipeline Build
```

This is known as **Pipeline as Code**.

It provides version control for the CI workflow itself.

Changes to the application and changes to the CI process can therefore be tracked using Git.

---

## 22. Jenkins Pipeline Stages

The resulting Pipeline is conceptually:

```text
+-------------------+
|    Environment    |
|-------------------|
| Node.js           |
| npm               |
| Java              |
+---------+---------+
          |
          v
+-------------------+
|   Syntax Check    |
|-------------------|
| server.js         |
| test.js           |
| public/script.js  |
+---------+---------+
          |
          v
+-------------------+
| Automated Tests   |
|-------------------|
| npm test          |
| 18 tests          |
| 18 passed         |
+---------+---------+
          |
          v
       SUCCESS
```

A successful Pipeline therefore confirms that the repository can be checked out and that the project's JavaScript and backend tests pass.

---

## 23. Jenkins SCM Polling Trigger

The Pipeline was also configured to demonstrate an SCM-based trigger.

The relevant Jenkins setting is:

```text
Build Triggers
    ☑ Poll SCM
```

with schedule:

```text
H/5 * * * *
```

This means Jenkins periodically checks the configured Git repository for source-code changes.

The conceptual workflow is:

```text
             GitHub
                │
                │
          New commit
                │
                ▼
        Jenkins SCM Poll
                │
          Change found?
           /         \
         No           Yes
         │             │
         ▼             ▼
      No build      Pipeline
                       │
                       ▼
                Environment
                       │
                       ▼
                 Syntax Check
                       │
                       ▼
                Automated Tests
                       │
                       ▼
                    SUCCESS
```

---

## 24. Poll SCM vs Build Periodically

The project uses **Poll SCM**, not **Build periodically**, because the purpose is to trigger CI based on source-code changes.

### Build periodically

Conceptually:

```text
Timer
  │
  ▼
Build
```

The build happens according to the schedule regardless of whether the source code changed.

### Poll SCM

Conceptually:

```text
Timer
  │
  ▼
Check Git repository
  │
  ▼
Changed?
 /    \
No    Yes
│      │
▼      ▼
Stop  Build
```

Poll SCM is therefore more appropriate for demonstrating a basic source-code-driven CI workflow in this local Jenkins setup.

---

## 25. Why GitHub Webhooks Were Not Used

Jenkins is running locally:

```text
http://localhost:8080
```

A GitHub webhook normally needs to reach Jenkins from GitHub's infrastructure.

A local `localhost` Jenkins installation is not normally reachable from the public Internet.

Therefore, the project uses:

```text
SCM Polling
```

for the local academic demonstration.

No external tunneling or port-forwarding infrastructure is required.

A public Jenkins endpoint could be introduced later if webhook-based CI is specifically required.

---

## 26. Current CI Workflow

The project now demonstrates the following development workflow:

```text
Developer
    │
    │ modify project
    ▼
Local Testing
    │
    ├── node --check
    └── npm test
    │
    ▼
Git Commit
    │
    ▼
GitHub
    │
    ▼
Jenkins SCM Polling
    │
    ▼
Pipeline
    │
    ├── Environment
    │
    ├── Syntax Check
    │
    └── Automated Tests
            │
            ▼
       18 tests pass
            │
            ▼
         SUCCESS
```

---

## 27. CI Verification Already Completed

The project has successfully demonstrated:

```text
✓ Git repository
✓ GitHub source control
✓ Jenkins installation
✓ Jenkins Job
✓ Manual Jenkins Build
✓ Git/SCM checkout
✓ Windows build commands
✓ Node.js environment verification
✓ npm environment verification
✓ Java environment verification
✓ JavaScript syntax checking
✓ Automated backend tests
✓ 18/18 automated tests passing
✓ Freestyle Jenkins Job
✓ Jenkins Pipeline Job
✓ Jenkinsfile
✓ Pipeline as Code
✓ Pipeline stages
✓ SCM Polling configuration
```

---

## 28. Automated Test Result

The local and Jenkins test process currently reports:

```text
tests     18
passed    18
failed     0
skipped    0
```

Therefore the current automated test suite is:

```text
18 / 18 PASS
```

---

## 29. CI Failure Behaviour

A useful property of the current setup is that a failing command causes Jenkins to mark the build as failed.

For example:

```text
Automated Tests
      │
      ▼
npm test
      │
   ┌──┴──┐
   │     │
 PASS   FAIL
   │     │
   ▼     ▼
SUCCESS FAILURE
```

This allows Jenkins to detect regressions automatically instead of relying only on manual testing.

A controlled failure test can be performed later as part of the CI demonstration.

---

## 30. Git and Jenkins Relationship

Git is responsible for version control.

Jenkins is responsible for CI automation.

```text
+------------------+
|       Git        |
|------------------|
| Track changes    |
| Commit history   |
| Branches         |
| Remote repository|
+--------+---------+
         |
         | Source code
         v
+------------------+
|     Jenkins      |
|------------------|
| Checkout         |
| Build            |
| Test             |
| Pipeline         |
| Automation       |
+------------------+
```

Neither tool replaces the other.

Git stores and tracks the project.

Jenkins automatically verifies the project.

---

## 31. Useful Commands

### Run application

```powershell
node server.js
```

### Run tests

```powershell
npm test
```

### Check backend syntax

```powershell
node --check server.js
```

### Check test syntax

```powershell
node --check test.js
```

### Check frontend JavaScript syntax

```powershell
node --check public/script.js
```

### Check Git status

```powershell
git status
```

### Stage changes

```powershell
git add <file>
```

### Commit changes

```powershell
git commit -m "message"
```

### Push changes

```powershell
git push origin main
```

### Start Jenkins

```powershell
E:
cd E:\Jenkins
java -jar jenkins.war
```

---

## 32. Development Workflow

The recommended workflow for future changes is:

```text
1. Modify code
       ↓
2. Run syntax checks
       ↓
3. Run npm test
       ↓
4. Verify application manually if necessary
       ↓
5. git status
       ↓
6. git add
       ↓
7. git commit
       ↓
8. git push
       ↓
9. Jenkins detects repository change
       ↓
10. Jenkins Pipeline runs
       ↓
11. Review build result
```

---

## 33. Project Design Philosophy

This project intentionally avoids unnecessary complexity.

It does not currently use:

- Express.js
- React
- Angular
- Vue
- MongoDB
- MySQL
- PostgreSQL
- Jest
- Mocha
- TypeScript
- Docker
- Kubernetes
- cloud infrastructure

The purpose is to demonstrate the underlying DevOps practices without hiding the concepts behind a large framework stack.

The application can therefore be understood and maintained easily while still providing a foundation for future DevOps stages.

---

## 34. Future DevOps Extensions

The project is intended to evolve gradually.

Possible future stages include:

```text
Current
   │
   ▼
Git + GitHub
   │
   ▼
Jenkins CI
   │
   ▼
Automated Testing
   │
   ▼
Pipeline as Code
   │
   ▼
SCM Trigger
   │
   ▼
Docker
   │
   ▼
Containerized Application
   │
   ▼
Kubernetes
   │
   ▼
Container Orchestration
```

Future Docker/Kubernetes work should build on the existing project rather than unnecessarily restructuring the application.

---

## 35. Important Notes

### Database

`database.json` contains application registration data and is treated as a local project database.

For the academic project, it may contain test/demo data only.

It should not contain real student credentials or sensitive personal information.

### Passwords

Passwords are hashed before storage and are not returned to the browser.

The project uses a simple 4-digit PIN because that is part of the academic application's specified requirements.

A real authentication system should use significantly stronger password requirements and a password-hashing algorithm designed specifically for password storage.

### Security

This is an educational project.

The application demonstrates basic security practices such as:

- server-side validation
- password hashing
- HttpOnly session cookies
- SameSite cookie protection
- avoiding exposure of password hashes
- restricting static files to `public/`

It is not intended for production deployment without substantial additional security hardening.

---

## 36. Current Status

```text
Application
    ✓ Complete basic registration/authentication flow

Version Control
    ✓ Git
    ✓ GitHub
    ✓ .gitignore
    ✓ Meaningful commits

Testing
    ✓ Automated backend tests
    ✓ 18/18 tests passing
    ✓ JavaScript syntax checks

Jenkins
    ✓ Freestyle Job
    ✓ Manual Builds
    ✓ Git SCM checkout
    ✓ Build automation
    ✓ Pipeline Job
    ✓ Jenkinsfile
    ✓ Pipeline stages
    ✓ Pipeline as Code
    ✓ SCM Polling configuration

Future
    → Controlled CI failure demonstration
    → Additional Jenkins automation where useful
    → Docker
    → Kubernetes
```

---

## 37. Final CI Architecture

The current project can be summarized by the following architecture:

```text
                         +----------------+
                         |    Developer   |
                         +-------+--------+
                                 |
                                 | Git commit
                                 v
                         +----------------+
                         |     GitHub     |
                         |    main       |
                         +-------+--------+
                                 |
                                 | SCM Poll
                                 v
                    +--------------------------+
                    |         Jenkins          |
                    |                          |
                    |  DOPP-Class-Registration |
                    |       -Pipeline          |
                    +------------+-------------+
                                 |
                                 v
                     +-----------------------+
                     |      Jenkinsfile      |
                     +-----------+-----------+
                                 |
                 +---------------+---------------+
                 |               |               |
                 v               v               v
          +------------+  +------------+  +-------------+
          | Environment|  |   Syntax   |  | Automated   |
          |   Check    |  |   Check    |  |    Tests    |
          +------------+  +------------+  +-------------+
                                                |
                                                v
                                          +-----------+
                                          | 18 / 18   |
                                          |   PASS    |
                                          +-----+-----+
                                                |
                                                v
                                           +---------+
                                           | SUCCESS |
                                           +---------+
```

---

## 38. Summary

The DOPP Class Registration project demonstrates how a simple web application can be progressively integrated into a DevOps workflow.

The application itself uses a minimal technology stack:

```text
HTML + CSS + JavaScript
          +
       Node.js
          +
      JSON DB
```

The DevOps workflow adds:

```text
Git
  +
GitHub
  +
Automated Tests
  +
Jenkins
  +
Pipeline
  +
Jenkinsfile
  +
SCM Polling
```

The resulting workflow is:

```text
        CODE
          │
          ▼
       GitHub
          │
          ▼
       Jenkins
          │
          ▼
      Pipeline
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
  ENV   SYNTAX  TEST
    │     │     │
    └─────┴─────┘
          │
          ▼
       SUCCESS
```

This provides a simple but complete foundation for extending the same project into containerization and orchestration using Docker and Kubernetes in later stages.
