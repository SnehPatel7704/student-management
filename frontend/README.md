# Campusdesk ERP

Campusdesk is a full-stack student management and academic operations platform built with React, Vite, Tailwind CSS, Express, and MongoDB. It provides student administration, academic analytics, course and faculty management, internships, attendance, clubs, library circulation, grades, and GPA reporting.

## Architecture

```text
student-management/
├── backend/
│   ├── controllers/erpController.js
│   ├── models/
│   │   ├── Student.js
│   │   ├── Course.js
│   │   ├── Instructor.js
│   │   ├── Internship.js
│   │   ├── Attendance.js
│   │   ├── Club.js
│   │   ├── Book.js
│   │   ├── BorrowRecord.js
│   │   └── ExamResult.js
│   ├── routes/erpRoutes.js
│   ├── scripts/verify-api.sh
│   └── server.js
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── AnalyticsDashboard.jsx
    │   │   ├── AttendanceTracker.jsx
    │   │   ├── ClubDirectory.jsx
    │   │   ├── CoursesView.jsx
    │   │   ├── CSVImportModal.jsx
    │   │   ├── EntityFormModal.jsx
    │   │   ├── GradesView.jsx
    │   │   ├── InstructorsView.jsx
    │   │   ├── InternshipBoard.jsx
    │   │   ├── LibraryView.jsx
    │   │   ├── Navigation.jsx
    │   │   ├── StudentModal.jsx
    │   │   └── StudentTable.jsx
    │   └── services/api.js
    ├── package.json
    ├── vite.config.js
    └── eslint.config.js
```

The React application owns UI state and orchestration in `App.jsx`. API requests are centralized in `services/api.js`, while Express separates persistence models from HTTP handlers and routes.

## Modules

1. **Students** — create, view, edit, delete, search, filter, sort, paginate, bulk import, and bulk delete.
2. **Analytics** — course distribution, age groups, and monthly enrollment aggregation.
3. **Courses** — catalog, capacity, credits, department, and instructor assignment.
4. **Instructors** — faculty roster and contact information.
5. **Internships** — opportunities, status, deadlines, and student applications.
6. **Attendance** — daily attendance records and percentage calculations.
7. **Clubs** — club directory, coordinator, category, and membership.
8. **Library** — book inventory, availability, issue, return, and borrowing history.
9. **Grades** — marks, letter grades, GPA, and SGPA reporting.

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
- JWT authentication, role-based module access, and super-admin account management

## Roles & Access

All ERP endpoints except health and login require a bearer token. Permissions are checked by the backend and mirrored in the UI.

| Role | Access |
| --- | --- |
| Super admin | All ERP operations, account provisioning, and role assignment |
| Admin | Full ERP operations, except account administration |
| Director | Read-only access across academic and operational modules, including analytics |
| Head | Student, course, attendance, and grade management within the assigned department; read access to other modules |
| Teacher | Read assigned department students/courses; manage attendance and grades for assigned courses |
| Student | Own linked portal, grades, attendance, internships, clubs, and library borrowing |
| Parent | Read-only portal for the linked student |
| Guest | Read-only courses, internships, clubs, and library catalog |

Student and parent accounts must link to a student record; teacher accounts must link to an instructor record. Head and director accounts require a department.

## First Super Admin

Copy `backend/.env.example` to `backend/.env` and set a unique `JWT_SECRET`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD` (at least 10 characters). Start MongoDB, then provision the first account:

```bash
cd student-management/backend
npm run create-super-admin
```

Start the backend and frontend as described below, then sign in. A super admin can create the remaining role accounts in **Users**. Never use the development JWT fallback in production; production startup requires `JWT_SECRET`.

For local role testing, seed sample records first, set `DEV_USER_EMAIL` and `DEV_USER_PASSWORD` in `backend/.env`, then run:

```bash
cd student-management/backend
npm run create-dev-user
```

Sign in with that account. In development mode, the header exposes a role selector that issues a new short-lived token for the selected role. The dev account and role-switch endpoint are disabled in production.

Run the RBAC matrix after provisioning the dev account:

```bash
cd student-management/backend
npm run verify-rbac
```

The API regression script requires an account with student-management permissions:

```bash
API_EMAIL=developer@campusdesk.local API_PASSWORD='your-local-password' bash backend/scripts/verify-api.sh
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally at `127.0.0.1:27017`, or a reachable `MONGODB_URI`

## Installation

```bash
cd student-management/backend
npm install

cd ../frontend
npm install
```

## Run locally

Start the backend:

```bash
cd student-management/backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd student-management/frontend
npm run dev
```

The application is available at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

To configure a different backend URL, create a local `.env.local` file in the frontend:

```text
VITE_API_URL=http://localhost:5000
```

## Backend API

Authentication routes are `/auth/login` and `/auth/me`; super-admin account CRUD is under `/users`. ERP routes are mounted from `erpRoutes.js` and are also available under `/api` for compatibility. Send `Authorization: Bearer <token>` with protected requests.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Returns API and MongoDB status |
| GET | `/students` | Lists students with pagination, search, filter, and sort |
| POST | `/students` | Creates a student |
| PUT | `/students/:id` | Updates a student |
| DELETE | `/students/:id` | Deletes a student |
| POST | `/students/bulk-import` | Imports student records |
| POST | `/students/bulk-delete` | Deletes student records by ID |
| GET | `/students/analytics` | Returns student analytics |
| GET/POST/DELETE | `/courses` and `/courses/:id` | Lists, creates, and deletes courses |
| GET/POST/DELETE | `/instructors` and `/instructors/:id` | Lists, creates, and deletes instructors |
| GET/POST | `/internships` | Lists and creates internships |
| POST | `/internships/:id/apply` | Applies a student to an internship |
| GET/POST | `/clubs` | Lists and creates clubs |
| POST | `/clubs/:id/join` | Joins a student to a club |
| POST | `/attendance` | Logs attendance |
| GET | `/attendance/student/:id` | Returns attendance percentage and records |
| POST | `/grades` | Records marks and grade |
| GET | `/grades/student/:studentId` | Returns grades and GPA |
| GET/POST | `/books` | Lists and creates books |
| POST | `/library/issue` | Issues a book |
| POST | `/library/return/:recordId` | Returns a book |
| GET | `/library/student/:studentId` | Returns student borrowing history |

### Student creation

```bash
curl -i -X POST http://localhost:5000/students \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Aarav Shah",
    "email": "aarav@example.com",
    "course": "Computer Science",
    "age": 21
  }'
```

### Bulk student import and delete

```bash
IMPORT_RESPONSE=$(curl -sS -X POST http://localhost:5000/students/bulk-import \
  -H 'Content-Type: application/json' \
  -d '{"students":[{"name":"Runtime Test","email":"runtime-test@example.com","course":"CS101","age":22}]}')

STUDENT_ID=$(printf '%s' "$IMPORT_RESPONSE" | node -e "let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{const r=JSON.parse(d); if(!r.inserted?.[0]) throw new Error('No inserted student was returned'); console.log(r.inserted[0]._id)})")

curl -i -X POST http://localhost:5000/students/bulk-delete \
  -H 'Content-Type: application/json' \
  -d "{\"ids\":[\"$STUDENT_ID\"]}"
```

The import response includes `insertedCount`, `failedCount`, `errors`, and the generated `inserted` records.

## Frontend service layer

All HTTP calls are centralized in `src/services/api.js`.

Relevant services include:

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
- `fetchInternships()`, `createInternship(data)`, `applyInternship(id, studentId)`
- `fetchClubs()`, `createClub(data)`, `joinClub(id, studentId)`
- `logAttendance(data)`
- `fetchStudentAttendance(studentId)`
- `recordGrade(data)`
- `fetchStudentGrades(studentId)`
- `fetchBooks()`, `createBook(data)`
- `issueBook(data)`
- `returnBook(recordId)`
- `fetchStudentBorrows(studentId)`

## Environment variables

Backend:

- `PORT` — defaults to `5000`
- `MONGODB_URI` — defaults to `mongodb://127.0.0.1:27017/collegeDB`

Frontend:

- `VITE_API_URL` — defaults to `http://localhost:5000`

## Development commands

```bash
# Backend
npm run dev
npm start

# Frontend
npm run dev
npm run lint
npm run build
npm run preview

# Verify the live API
cd student-management
backend/scripts/verify-api.sh
```

Run the complete verification from the project root:

```bash
npm --prefix student-management/frontend run lint
npm --prefix student-management/frontend run build
node --check student-management/backend/server.js
node --check student-management/backend/controllers/erpController.js
node --check student-management/backend/routes/erpRoutes.js
```

## Validation and troubleshooting

- Confirm MongoDB is running before starting the backend.
- Confirm the backend responds at `http://localhost:5000/health`.
- Confirm the frontend responds at `http://localhost:5173`.
- Duplicate emails, invalid ObjectIds, and validation failures return descriptive HTTP errors.
- Run the API verification script after changing the routes or models.
- Run the frontend lint and production build before committing.

## Validation & Verification (V&V)

Campusdesk uses layered validation: client-side constraints provide immediate feedback, Mongoose schema options enforce database rules, and the Express error middleware converts failures into a uniform response shape.

### Run the API verification suite

From the repository root, start MongoDB and the backend, then run:

```bash
chmod +x backend/scripts/verify-api.sh
./backend/scripts/verify-api.sh
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

- **Positive:** health, database connectivity, student creation, query/pagination, and bulk delete.
- **Boundary:** student age `0` and `150`, duplicate email, maximum/minimum marks, and zero inventory availability.
- **Negative:** malformed ObjectId, unmapped valid ObjectId, invalid email, missing required fields, duplicate records, and out-of-range numeric values.

### Case matrix

| ID | Test | Expected result |
| --- | --- | --- |
| TC-P01 | `GET /health` | HTTP 200, `status: ok`, `database: connected` |
| TC-P02 | `POST /students` | HTTP 201 with a generated ObjectId |
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
2. Create a unique student and assert HTTP 201.
3. Repeat the same email and assert HTTP 400.
4. Exercise age boundary values `0` and `150` and assert HTTP 400.
5. Query with `search`, `page`, and `limit`, then assert structured pagination metadata.
6. Delete the created student through the bulk-delete endpoint and assert HTTP 200.
7. Verify malformed and unmapped ObjectIds produce HTTP 400 and 404 respectively.
8. Confirm unavailable inventory and out-of-range marks are rejected with HTTP 400.
9. Exit with status `1` if any test fails; otherwise exit with status `0`.
