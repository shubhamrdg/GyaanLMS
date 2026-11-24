// services/enrollmentService.js
// Enrollment is handled entirely by our own backend - there is no payment
// gateway. Paid courses are recorded as offline/manual enrollments.
import api from './api'
import toast from 'react-hot-toast'

export const enrollInCourse = async (courseId) => {
  const { data } = await api.post('/orders/create', { courseId })
  toast.success(data.message || (data.free ? 'Enrolled in free course!' : 'Enrollment confirmed!'))
  return { success: true, ...data }
}
