import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: '📊', end: true },
  { to: '/courses', label: 'Browse Courses', icon: '🔍' },
  { to: '/student/enrollments', label: 'My Enrollments', icon: '📖' },
  { to: '/student/assignments', label: 'Assignments', icon: '📝' },
  { to: '/student/certificates', label: 'Certificates', icon: '🏆' },
  { to: '/student/profile', label: 'My Profile', icon: '👤' },
  { to: '/student/settings', label: 'Change Password', icon: '🔑' },
  { to: '/student/feedback', label: 'Help & Feedback', icon: '💬' },
]

const facultyLinks = [
  { to: '/faculty', label: 'Dashboard', icon: '📊', end: true },
  { to: '/faculty/courses', label: 'My Courses', icon: '📚' },
  { to: '/faculty/create-course', label: 'Create Course', icon: '➕' },
  { to: '/faculty/students', label: 'Students', icon: '🎓' },
  { to: '/faculty/assignments', label: 'Assignments', icon: '📝' },
  { to: '/faculty/profile', label: 'My Profile', icon: '👤' },
  { to: '/faculty/settings', label: 'Change Password', icon: '🔑' },
]

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/courses', label: 'Courses', icon: '📚' },
  { to: '/admin/revenue', label: 'Revenue', icon: '💰' },
  { to: '/admin/contacts', label: 'Contacts', icon: '📩' },
  { to: '/admin/feedback', label: 'Feedback', icon: '⭐' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

const Sidebar = () => {
  const { user } = useSelector(state => state.auth)
  const [collapsed, setCollapsed] = useState(false)

  if (!user) return null

  let links = []
  let bgColor = ''
  let hoverBg = ''
  let activeBg = ''
  let textColor = ''

  if (user.role === 'student') {
    links = studentLinks
    bgColor = 'bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800'
    hoverBg = 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
    activeBg = 'bg-primary-600 shadow-lg shadow-primary-600/20'
    textColor = 'text-gray-600 dark:text-gray-400'
  } else if (user.role === 'faculty') {
    links = facultyLinks
    bgColor = 'bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800'
    hoverBg = 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
    activeBg = 'bg-primary-600 shadow-lg shadow-primary-600/20'
    textColor = 'text-gray-600 dark:text-gray-400'
  } else if (user.role === 'admin') {
    links = adminLinks
    bgColor = 'bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800'
    hoverBg = 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
    activeBg = 'bg-primary-600 shadow-lg shadow-primary-600/20'
    textColor = 'text-gray-600 dark:text-gray-400'
  }

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-72'} ${bgColor} flex-shrink-0 transition-all duration-300`}>
      <div className={`${collapsed ? 'p-3' : 'p-6'} border-b border-gray-50 dark:border-gray-800`}>
        <div className={`flex items-center ${collapsed ? 'flex-col gap-2 justify-center p-2' : 'gap-4 p-3'} bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm`}>
          <div className={`${collapsed ? 'w-10 h-10 text-base' : 'w-12 h-12 text-xl'} rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center font-black text-white shadow-lg shadow-primary-600/20 flex-shrink-0`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-600">{user?.role}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition shadow-sm"
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
      </div>
      <nav className={`${collapsed ? 'p-2' : 'p-4'} space-y-1.5`}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.end} title={collapsed ? link.label : undefined}
            className={({ isActive }) => `flex items-center ${collapsed ? 'justify-center px-2 py-3' : 'gap-4 px-4 py-3.5'} rounded-2xl text-sm font-bold transition-all duration-300 ${
              isActive
                ? `${activeBg} text-white`
                : `${textColor} ${hoverBg} hover:translate-x-1`
            }`}>
            <span className="text-lg flex-shrink-0">{link.icon}</span> {!collapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
