import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('campusdesk-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function loginUser(credentials) { const response = await api.post('/auth/login', credentials); return response.data }
export async function fetchCurrentUser() { const response = await api.get('/auth/me'); return response.data }
export async function fetchDevelopmentOptions() { const response = await api.get('/auth/dev-options'); return response.data }
export async function switchDevelopmentRole(role, context = {}) { const response = await api.post('/auth/dev-role', { role, ...context }); return response.data }
export async function fetchPortal() { const response = await api.get('/portal'); return response.data }
export async function fetchUsers() { const response = await api.get('/users'); return response.data }
export async function createUser(data) { const response = await api.post('/users', data); return response.data }
export async function updateUser(id, data) { const response = await api.put(`/users/${id}`, data); return response.data }
export async function deleteUser(id) { const response = await api.delete(`/users/${id}`); return response.data }

export async function fetchHealth() {
  const response = await api.get('/health')
  return response.data
}

export async function fetchStudents(queryParams = {}) {
  const response = await api.get('/students', { params: queryParams })
  return response.data
}
export async function createStudent(data) { const response = await api.post('/students', data); return response.data }
export async function updateStudent(id, data) { const response = await api.put(`/students/${id}`, data); return response.data }
export async function deleteStudent(id) { const response = await api.delete(`/students/${id}`); return response.data }
export async function bulkDeleteStudents(ids) { const response = await api.post('/students/bulk-delete', { ids }); return response.data }
export async function bulkImportStudents(data) { const response = await api.post('/students/bulk-import', data); return response.data }
export async function fetchStudentAnalytics() { const response = await api.get('/students/analytics'); return response.data }

export async function fetchCourses() { const response = await api.get('/courses'); return response.data }
export async function createCourse(data) { const response = await api.post('/courses', data); return response.data }
export async function updateCourse(id, data) { const response = await api.put(`/courses/${id}`, data); return response.data }
export async function deleteCourse(id) { const response = await api.delete(`/courses/${id}`); return response.data }
export async function fetchInstructors() { const response = await api.get('/instructors'); return response.data }
export async function createInstructor(data) { const response = await api.post('/instructors', data); return response.data }
export async function updateInstructor(id, data) { const response = await api.put(`/instructors/${id}`, data); return response.data }
export async function deleteInstructor(id) { const response = await api.delete(`/instructors/${id}`); return response.data }
export async function fetchLectures(params = {}) { const response = await api.get('/lectures', { params }); return response.data }
export async function createLecture(data) { const response = await api.post('/lectures', data); return response.data }
export async function updateLecture(id, data) { const response = await api.put(`/lectures/${id}`, data); return response.data }
export async function deleteLecture(id) { const response = await api.delete(`/lectures/${id}`); return response.data }
export async function fetchLectureAttendance(id, date) { const response = await api.get(`/lectures/${id}/attendance`, { params: { date } }); return response.data }
export async function saveLectureAttendance(id, data) { const response = await api.put(`/lectures/${id}/attendance`, data); return response.data }

export async function fetchInternships() { const response = await api.get('/internships'); return response.data }
export async function createInternship(data) { const response = await api.post('/internships', data); return response.data }
export async function updateInternship(id, data) { const response = await api.put(`/internships/${id}`, data); return response.data }
export async function deleteInternship(id) { const response = await api.delete(`/internships/${id}`); return response.data }
export async function applyInternship(id, studentId) { const response = await api.post(`/internships/${id}/apply`, { studentId }); return response.data }
export async function fetchClubs() { const response = await api.get('/clubs'); return response.data }
export async function createClub(data) { const response = await api.post('/clubs', data); return response.data }
export async function updateClub(id, data) { const response = await api.put(`/clubs/${id}`, data); return response.data }
export async function deleteClub(id) { const response = await api.delete(`/clubs/${id}`); return response.data }
export async function joinClub(id, studentId) { const response = await api.post(`/clubs/${id}/join`, { studentId }); return response.data }

export async function logAttendance(data) { const response = await api.post('/attendance', data); return response.data }
export async function updateAttendance(id, data) { const response = await api.put(`/attendance/${id}`, data); return response.data }
export async function deleteAttendance(id) { const response = await api.delete(`/attendance/${id}`); return response.data }
export async function fetchStudentAttendance(studentId) { const response = await api.get(`/attendance/student/${studentId}`); return response.data }
export async function recordGrade(data) { const response = await api.post('/grades', data); return response.data }
export async function updateGrade(id, data) { const response = await api.put(`/grades/${id}`, data); return response.data }
export async function deleteGrade(id) { const response = await api.delete(`/grades/${id}`); return response.data }
export async function fetchStudentGrades(studentId) { const response = await api.get(`/grades/student/${studentId}`); return response.data }

export async function fetchBooks() { const response = await api.get('/books'); return response.data }
export async function createBook(data) { const response = await api.post('/books', data); return response.data }
export async function updateBook(id, data) { const response = await api.put(`/books/${id}`, data); return response.data }
export async function deleteBook(id) { const response = await api.delete(`/books/${id}`); return response.data }
export async function issueBook(data) { const response = await api.post('/library/issue', data); return response.data }
export async function returnBook(recordId) { const response = await api.post(`/library/return/${recordId}`); return response.data }
export async function fetchStudentBorrows(studentId) { const response = await api.get(`/library/student/${studentId}`); return response.data }
