import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } })

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
export async function deleteCourse(id) { const response = await api.delete(`/courses/${id}`); return response.data }
export async function fetchInstructors() { const response = await api.get('/instructors'); return response.data }
export async function createInstructor(data) { const response = await api.post('/instructors', data); return response.data }
export async function deleteInstructor(id) { const response = await api.delete(`/instructors/${id}`); return response.data }

export async function fetchInternships() { const response = await api.get('/internships'); return response.data }
export async function createInternship(data) { const response = await api.post('/internships', data); return response.data }
export async function applyInternship(id, studentId) { const response = await api.post(`/internships/${id}/apply`, { studentId }); return response.data }
export async function fetchClubs() { const response = await api.get('/clubs'); return response.data }
export async function createClub(data) { const response = await api.post('/clubs', data); return response.data }
export async function joinClub(id, studentId) { const response = await api.post(`/clubs/${id}/join`, { studentId }); return response.data }

export async function logAttendance(data) { const response = await api.post('/attendance', data); return response.data }
export async function fetchStudentAttendance(studentId) { const response = await api.get(`/attendance/student/${studentId}`); return response.data }
export async function recordGrade(data) { const response = await api.post('/grades', data); return response.data }
export async function fetchStudentGrades(studentId) { const response = await api.get(`/grades/student/${studentId}`); return response.data }

export async function fetchBooks() { const response = await api.get('/books'); return response.data }
export async function createBook(data) { const response = await api.post('/books', data); return response.data }
export async function issueBook(data) { const response = await api.post('/library/issue', data); return response.data }
export async function returnBook(recordId) { const response = await api.post(`/library/return/${recordId}`); return response.data }
export async function fetchStudentBorrows(studentId) { const response = await api.get(`/library/student/${studentId}`); return response.data }

