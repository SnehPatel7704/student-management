# Campusdesk ERP

Campusdesk is a full-stack student management and academic operations platform built with React, Vite, Tailwind CSS, Express, and MongoDB. It provides student administration, academic analytics, course and faculty management, internships, attendance, clubs, library circulation, grades, and GPA reporting.

## Architecture

```text
student-management/
├── backend/
│   ├── auth/                 # Role permissions
│   ├── controllers/          # Auth, ERP, and user handlers
│   ├── middleware/           # Authentication and authorization
│   ├── models/               # MongoDB/Mongoose models
│   ├── routes/               # Auth, ERP, and user routes
│   ├── scripts/              # Account, migration, and verification scripts
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/       # ERP views, login, portal, and user management
    │   ├── hooks/
    │   └── services/api.js
    ├── package.json
    └── vite.config.js
```

The React application owns UI state and orchestration in `App.jsx`. API requests and bearer-token handling are centralized in `services/api.js`; the Express backend separates authentication, permissions, persistence models, handlers, and routes.

## Modules

1. **Students** — create, view, edit, delete, search, filter, sort, paginate, bulk import, and bulk delete.
2. **Analytics** — course distribution, age groups, and monthly enrollment aggregation.
3. **Courses & lectures** — course catalog, schedules, capacity, credits, instructor assignment, and lecture attendance.
4. **Instructors** — faculty roster and contact information.
5. **Internships** — opportunities, status, deadlines, and student applications.
6. **Attendance & grades** — daily and lecture attendance, marks, GPA, and SGPA reporting.
7. **Clubs** — club directory, coordinator, category, and membership.
8. **Library** — book inventory, availability, issue, return, and borrowing history.
9. **Accounts & portal** — role-based access, super-admin account management, and linked student/parent portals.

## Features

- Live MongoDB health checks
- Server-side pagination, filtering, and sorting
- Student CSV import and export
- Bulk student delete operations
- Inline form validation and loading states
- Transactional book issue handling
- Attendance and grade aggregation
- Responsive modular React views
- Toast notifications and API error handling
- Reusable create forms for courses, instructors, internships, clubs, and books
- JWT login and server-enforced role permissions
- Role-based user management and linked student/parent portals

## Roles and access

Protected ERP requests require a bearer token. The backend enforces permissions for each request; the UI also hides actions the current role cannot use.

| Role | Summary |
| --- | --- |
| Super admin | All ERP permissions and user account administration |
| Admin | Full ERP operations, without user account administration |
| Director | Read access across modules, with analytics and student management |
| Head | Department-oriented student, course, attendance, and grade management |
| Teacher | Read access to students and courses; attendance and grade management |
| Student | Linked portal, course and library access, internship applications, and club membership |
| Parent | Read-only linked portal and course/library access |
| Guest | Read-only course, internship, club, and library access |

Student and parent accounts must be linked to a student record; teacher accounts must be linked to an instructor record. Head and director accounts require a department. The development-only `dev` account is used to test application roles and cannot be used in production.

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally at `127.0.0.1:27017`, or a reachable `MONGODB_URI`

## Installation and configuration

Install dependencies from the repository root:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Configure the backend environment:

```bash
cp backend/.env.example backend/.env
```

Set a unique `JWT_SECRET`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD` in `backend/.env`. The password must be at least 10 characters. Set `MONGODB_URI` if MongoDB is not using the local default. Do not use development secrets or accounts in production.

Create the first super-admin account after MongoDB is running:

```bash
npm --prefix backend run create-super-admin
```

Start the backend and frontend in separate terminals from the repository root:

```bash
npm --prefix backend run dev
```

```bash
npm --prefix frontend run dev
```

The application is available at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

To configure a different backend URL, create a local `.env.local` file in the frontend:

```text
VITE_API_URL=http://localhost:5000
```

## Development accounts

To test roles locally, seed sample records and configure a development account in `backend/.env`:

```bash
npm --prefix backend run seed
npm --prefix backend run create-dev-user
```

Set `DEV_USER_EMAIL` and `DEV_USER_PASSWORD` before creating the account. In development, sign in with it and use the role selector to switch roles. Development accounts and role switching are disabled in production.

Run the role-permission checks after setting up the development account:

```bash
npm --prefix backend run verify-rbac
```

## Backend API

Authentication routes are mounted at `/auth` (also `/api/auth`); development accounts also use `GET /auth/dev-options` and `POST /auth/dev-role` to test roles locally. User administration is mounted at `/users` (also `/api/users`) and is restricted to super admins. ERP routes are available both at the root and under `/api`. `/health` and login are public; all other ERP routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Returns API and MongoDB status |
| POST | `/auth/login` | Signs in and returns a JWT and user permissions |
| GET | `/auth/me` | Returns the current authenticated user |
| GET/POST/PUT/DELETE | `/users` and `/users/:id` | Super-admin user account management |
| GET | `/portal` | Returns portal data for the linked student or parent |
| GET/POST/PUT/DELETE | `/students` and `/students/:id` | Student records; list supports query and pagination |
| POST | `/students/bulk-import` | Imports student records |
| POST | `/students/bulk-delete` | Deletes student records by ID |
| GET | `/students/analytics` | Returns student analytics |
| GET/POST/PUT/DELETE | `/courses` and `/courses/:id` | Course catalog management |
| GET/POST/PUT/DELETE | `/instructors` and `/instructors/:id` | Instructor management |
| GET/POST/PUT/DELETE | `/lectures` and `/lectures/:id` | Lecture schedule management |
| GET/PUT | `/lectures/:id/attendance` | Reads or saves attendance for a lecture and date |
| GET/POST/PUT/DELETE | `/internships` and `/internships/:id` | Internship opportunity management |
| POST | `/internships/:id/apply` | Applies a student to an internship |
| GET/POST/PUT/DELETE | `/clubs` and `/clubs/:id` | Club management |
| POST | `/clubs/:id/join` | Joins a student to a club |
| POST/PUT/DELETE | `/attendance` and `/attendance/:id` | Attendance record management |
| GET | `/attendance/student/:id` | Returns attendance percentage and records |
| POST/PUT/DELETE | `/grades` and `/grades/:id` | Grade record management |
| GET | `/grades/student/:studentId` | Returns grades and GPA |
| GET/POST/PUT/DELETE | `/books` and `/books/:id` | Library book catalog management |
| POST | `/library/issue` | Issues a book |
| POST | `/library/return/:recordId` | Returns a book |
| GET | `/library/student/:studentId` | Returns student borrowing history |

### Authenticated API requests

Log in with an account created through the UI or the super-admin setup above. The response contains a `token`; include it as a bearer token on protected requests:

```bash
curl -sS -X POST http://localhost:5000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

Use the returned token as `TOKEN` in the following examples:

```bash
curl -i -X POST http://localhost:5000/students \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Aarav Shah","email":"aarav@example.com","course":"Computer Science","age":21}'
```

Bulk import and delete also require the token and a role with student-management permission:

```bash
curl -i -X POST http://localhost:5000/students/bulk-import \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"students":[{"name":"Runtime Test","email":"runtime-test@example.com","course":"CS101","age":22}]}'
```

The import response includes `insertedCount`, `failedCount`, `errors`, and the created records.

## Frontend service layer

All HTTP calls are centralized in `src/services/api.js`.

Relevant services include:

- `loginUser(credentials)`, `fetchCurrentUser()`, `fetchPortal()`
- `fetchUsers()`, `createUser(data)`, `updateUser(id, data)`, `deleteUser(id)`
- `fetchHealth()`
- `fetchStudents(queryParams)`
- `createStudent(data)`
- `updateStudent(id, data)`
- `deleteStudent(id)`
- `bulkImportStudents(data)`
- `bulkDeleteStudents(ids)`
- `fetchStudentAnalytics()`
- `fetchCourses()`, `createCourse(data)`, `deleteCourse(id)`
- `fetchInstructors()`, `createInstructor(data)`, `deleteInstructor(id)`
- `fetchLectures(params)`, `createLecture(data)`, `updateLecture(id, data)`, `deleteLecture(id)`
- `fetchLectureAttendance(id, date)`, `saveLectureAttendance(id, data)`
- `fetchInternships()`, `createInternship(data)`, `applyInternship(id, studentId)`
- `fetchClubs()`, `createClub(data)`, `joinClub(id, studentId)`
- `logAttendance(data)`, `updateAttendance(id, data)`, `deleteAttendance(id)`
- `fetchStudentAttendance(studentId)`
- `recordGrade(data)`, `updateGrade(id, data)`, `deleteGrade(id)`
- `fetchStudentGrades(studentId)`
- `fetchBooks()`, `createBook(data)`, `updateBook(id, data)`, `deleteBook(id)`
- `issueBook(data)`
- `returnBook(recordId)`
- `fetchStudentBorrows(studentId)`

## Environment variables

Backend:

- `PORT` — defaults to `5000`
- `MONGODB_URI` — defaults to `mongodb://127.0.0.1:27017/collegeDB`
- `JWT_SECRET` — signing secret; required in production
- `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` — first super-admin provisioning
- `DEV_USER_NAME`, `DEV_USER_EMAIL`, `DEV_USER_PASSWORD` — optional local development account
- `DEV_DEFAULT_ROLE` — default role for a development account; defaults to `admin`

Frontend:

- `VITE_API_URL` — defaults to `http://localhost:5000`

## Development commands

```bash
# Backend
npm --prefix backend run dev
npm --prefix backend start
npm --prefix backend run seed
npm --prefix backend run migrate:lecture-attendance-index

# Frontend
npm --prefix frontend run dev
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix frontend run preview

# Verify the live API
API_EMAIL=admin@example.com API_PASSWORD='your-password' bash backend/scripts/verify-api.sh
npm --prefix backend run verify-rbac
```

Check JavaScript syntax:

```bash
node --check backend/server.js
node --check backend/controllers/erpController.js
node --check backend/routes/erpRoutes.js
```

## Validation and troubleshooting

- Confirm MongoDB is running before starting the backend.
- Confirm the backend responds at `http://localhost:5000/health`.
- Confirm the frontend responds at `http://localhost:5173`.
- Confirm protected API requests include a valid bearer token and the account has the required role permission.
- Duplicate emails, invalid ObjectIds, and validation failures return descriptive HTTP errors.
- Run the API verification script after changing the routes or models.
- Run the RBAC verification script after changing authentication or permissions.
- Run the frontend lint and production build before committing.

## Validation & Verification (V&V)

Campusdesk uses layered validation: client-side constraints provide immediate feedback, Mongoose schema options enforce database rules, and the Express error middleware converts failures into a uniform response shape.

### Run the API verification suite

From the repository root, configure an account with student-management permissions, start MongoDB and the backend, then run:

```bash
API_EMAIL=admin@example.com API_PASSWORD='your-password' bash backend/scripts/verify-api.sh
```

The runner reports `[PASS]` and `[FAIL]` tags, prints the HTTP status and response body for each assertion, and exits with status `1` when any case fails. The suite uses an isolated runtime identifier and cleans up temporary response files automatically.

### Validation matrix

| Entity | Field | Validation Rules | Client Enforcement | DB Enforcement | Error Response Codes |
| --- | --- | --- | --- | --- | --- |
| Student | Name | Required; maximum 80 characters; trimmed | `required`, `maxLength={80}`, blur trimming | Mongoose `trim`, `maxlength` | 400 for validation failure; 404 for missing record |
| Student | Email | Required; RFC 5322-style address; lowercase; unique | Pattern, lowercase transform, `maxLength=254` | Mongoose `match`, `lowercase`, `unique` | 400 for duplicate/invalid; 404 for missing record |
| Student | Age | Whole number from 1 through 120 | `type="number"`, `min="1"`, `max="120"`, inline warning | Mongoose `min` and `max` | 400 for boundary failure |
| Course | Credits | Integer from 1 through 6 | `min="1"`, `max="6"`, inline warning | Mongoose `min`, `max` | 400 for validation failure |
| Course | Capacity | Minimum 1 | `min="1"`, inline warning | Mongoose `min` | 400 for validation failure |
| Student | Course | Required and maximum 80 characters | Required and max length | Mongoose schema constraints | 400 for validation failure |
| Exam result | Marks | `0 <= marksObtained <= maxMarks`; `maxMarks >= 1` | API validation and form-safe request handling | Controller guard and Mongoose `runValidators: true` | 400 for out-of-range values |
| Library | Inventory | `availableCopies <= 0` rejects issuance | API inventory check | Transactional availability check with `runValidators: true` | 400 for unavailable inventory; 404 for missing book |
| All models | ObjectId | Valid MongoDB identifier | UI/API request handling | Mongoose reference and cast handling | 400 for malformed ID; 404 for unmapped record |
| All models | Duplicate key | Unique value must not be repeated | Server-side API handling | MongoDB duplicate-key error | 400 for duplicate key |

### Test coverage

- **Positive:** public health, database connectivity, authenticated student creation, query/pagination, and bulk delete.
- **Boundary:** student age `0` and `150`, duplicate email, maximum/minimum marks, and zero inventory availability.
- **Negative:** anonymous access to protected routes, malformed ObjectId, unmapped valid ObjectId, invalid email, missing required fields, duplicate records, and out-of-range numeric values.

### Case matrix

| ID | Test | Expected result |
| --- | --- | --- |
| TC-P01 | `GET /health` | HTTP 200, `status: ok`, `database: connected` |
| TC-A01 | Anonymous `GET /students` | HTTP 401 |
| TC-P02 | Authenticated `POST /students` | HTTP 201 with a generated ObjectId |
| TC-N01 | Duplicate student email | HTTP 400 with uniform `{ success: false, message }` response |
| TC-N02 | Age `0` and `150` | HTTP 400 for both boundary violations |
| TC-P03 | `POST /students/bulk-delete` | HTTP 200 with `deletedCount` |
| TC-P04 | Student search and pagination | HTTP 200 with `students`, `pagination.total`, `pagination.totalPages`, and `pagination.limit` |
| TC-N03 | `GET /students/invalid_id` | HTTP 400 with descriptive error |
| TC-N04 | Update unmapped valid ObjectId | HTTP 404 with uniform error response |
| TC-N05 | Issue from zero-availability book | HTTP 400 with inventory safety message |
| TC-N06 | Marks above `maxMarks` | HTTP 400 with boundary message |

### Error response contract

All handled API failures return:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

Handled cases include duplicate keys (`11000`), Mongoose `ValidationError`, and Mongoose `CastError`. Unexpected server failures return HTTP 500 with the same response shape.

### Positive and negative test sequence

1. Verify system health and MongoDB connectivity.
2. Log in with an account that has student-management permission.
3. Verify anonymous student access is rejected with HTTP 401.
4. Create a unique student using the bearer token and assert HTTP 201.
5. Repeat the same email and assert HTTP 400.
6. Exercise age boundary values `0` and `150` and assert HTTP 400.
7. Query with `search`, `page`, and `limit`, then assert structured pagination metadata.
8. Delete the created student through the bulk-delete endpoint and assert HTTP 200.
9. Verify malformed and unmapped ObjectIds produce HTTP 400 and 404 respectively.
10. Confirm unavailable inventory and out-of-range marks are rejected with HTTP 400.
11. Exit with status `1` if any test fails; otherwise exit with status `0`.
