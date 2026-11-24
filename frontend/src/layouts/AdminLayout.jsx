// layouts/AdminLayout.jsx

import { NavLink, Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'

import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageUsers from '../pages/admin/ManageUsers'
import ManageCourses from '../pages/admin/ManageCourses'
import CreateCourse from '../pages/faculty/CreateCourse'
import Revenue from '../pages/admin/Revenue'
import Settings from '../pages/Settings'
import AdminContacts from '../pages/admin/AdminContacts'
import AdminFeedback from '../pages/admin/AdminFeedback'
import EditCourse from '../pages/faculty/EditCourse'
import CourseLectures from '../pages/faculty/CourseLectures'
import CreateLecture from '../pages/faculty/CreateLecture'
import EditLecture from '../pages/faculty/EditLecture'
import CollapsibleSidebar from '../components/CollapsibleSidebar'

const navLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/create-course', label: 'Create Course', icon: '➕' },
  { to: '/admin/revenue', label: 'Revenue', icon: '💰' },
  { to: '/admin/contacts', label: 'Contacts', icon: '📩' },
  { to: '/admin/feedback', label: 'Feedback', icon: '⭐' },
  { to: '/admin/settings', label: 'Change Password', icon: '🔑' },
]

const AdminLayout = () => {
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
        userRole="Administrator"
        links={navLinks}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        menuLabel="admin menu"
      />

      {/* ================= MOBILE SIDEBAR OVERLAY ================= */}
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
                  Admin Menu
                </p>

                <button
                  onClick={closeMobileSidebar}
                  className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-white"
                  aria-label="Close admin menu"
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
                    Administrator
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

      {/* ================= CONTENT ================= */}
      <main className="relative flex-1 min-w-0 bg-gray-50 dark:bg-gray-900 overflow-x-hidden">

        {/* Mobile admin menu button */}
        <div className="lg:hidden sticky top-0 z-40 px-4 py-3 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-black text-gray-800 dark:text-white shadow-sm"
          >
            ☰
            <span>Admin Menu</span>
          </button>
        </div>

        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="courses/:courseId/edit" element={<EditCourse />} />
          <Route path="courses/:courseId/lectures" element={<CourseLectures />} />
          <Route path="courses/:courseId/add-lecture" element={<CreateLecture />} />
          <Route path="courses/:courseId/lectures/:lectureId/edit" element={<EditLecture />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminLayout