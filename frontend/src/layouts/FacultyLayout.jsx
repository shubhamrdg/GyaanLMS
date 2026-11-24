// layouts/FacultyLayout.jsx

import { NavLink, Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'

import FacultyDashboard from '../pages/faculty/FacultyDashboard'
import FacultyCourses from '../pages/faculty/FacultyCourses'
import FacultyStudents from '../pages/faculty/FacultyStudents'
import FacultyAssignments from '../pages/faculty/FacultyAssignments'
import ManageAssignments from '../pages/faculty/ManageAssignments'
import CreateCourse from '../pages/faculty/CreateCourse'
import CreateLecture from '../pages/faculty/CreateLecture'
import CourseLectures from '../pages/faculty/CourseLectures'
import EditCourse from '../pages/faculty/EditCourse'
import EditLecture from '../pages/faculty/EditLecture'
import ViewStudents from '../pages/faculty/ViewStudents'
import ManageQueries from '../pages/faculty/ManageQueries'
import ManageSessions from '../pages/faculty/ManageSessions'
import Settings from '../pages/Settings'
import Profile from '../pages/student/Profile'
import CollapsibleSidebar from '../components/CollapsibleSidebar'

const navLinks = [
  { to: '/faculty', label: 'Dashboard', icon: '📊', end: true },
  { to: '/faculty/courses', label: 'My Courses', icon: '📚' },
  { to: '/faculty/create-course', label: 'Create Course', icon: '➕' },
  { to: '/faculty/students', label: 'Students', icon: '🎓' },
  { to: '/faculty/assignments', label: 'Assignments', icon: '📝' },
  { to: '/faculty/queries', label: 'Student Queries', icon: '💬' },
  { to: '/faculty/sessions', label: 'Live Sessions', icon: '📅' },
  { to: '/faculty/profile', label: 'My Profile', icon: '👤' },
  { to: '/faculty/settings', label: 'Change Password', icon: '🔑' },
]

const FacultyLayout = () => {
  const { user } = useSelector(state => state.auth)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false)
  }

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] min-w-0 overflow-x-hidden bg-gray-50 dark:bg-gray-900 lg:min-h-[calc(100dvh-6rem)]">

      {/* ================= DESKTOP SIDEBAR (collapsible) ================= */}
      <CollapsibleSidebar
        userName={user?.name}
        userRole="Faculty"
        links={navLinks}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        menuLabel="faculty menu"
      />

      {/* ================= MOBILE SIDEBAR ================= */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
          onClick={closeMobileSidebar}
        >
          <aside
            className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >

            <div className="p-5 border-b border-gray-100 dark:border-gray-800">

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                  Faculty Menu
                </p>

                <button
                  onClick={closeMobileSidebar}
                  className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-white"
                  aria-label="Close faculty menu"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">

                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center font-black text-lg text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="overflow-hidden">
                  <p className="font-bold text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </p>

                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-600">
                    Faculty
                  </p>
                </div>

              </div>
            </div>

            <nav className="p-4 space-y-1.5">

              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`
                  }
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}

            </nav>
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="relative flex-1 min-w-0 bg-gray-50 dark:bg-gray-900 overflow-x-hidden">

        {/* Mobile menu button */}
        <div className="lg:hidden sticky top-0 z-40 px-4 py-3 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">

          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-black text-gray-800 dark:text-white shadow-sm"
          >
            ☰
            <span>Faculty Menu</span>
          </button>

        </div>

        <Routes>
          <Route index element={<FacultyDashboard />} />
          <Route path="courses" element={<FacultyCourses />} />
          <Route path="students" element={<FacultyStudents />} />
          <Route path="assignments" element={<FacultyAssignments />} />
          <Route path="queries" element={<ManageQueries />} />
          <Route path="sessions" element={<ManageSessions />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="courses/:courseId/edit" element={<EditCourse />} />
          <Route path="courses/:courseId/lectures" element={<CourseLectures />} />
          <Route path="courses/:courseId/lectures/:lectureId/edit" element={<EditLecture />} />
          <Route path="courses/:courseId/assignments" element={<ManageAssignments />} />
          <Route path="courses/:courseId/add-lecture" element={<CreateLecture />} />
          <Route path="courses/:courseId/students" element={<ViewStudents />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Routes>

      </main>
    </div>
  )
}

export default FacultyLayout