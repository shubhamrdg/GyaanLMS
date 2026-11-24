// components/CollapsibleSidebar.jsx — shared collapsible sidebar used by all layouts
import { NavLink } from 'react-router-dom'

const CollapsibleSidebar = ({ userName, userRole, links, collapsed, onToggle, menuLabel = 'Menu', scrollable = false }) => {
  return (
    <aside
      className={`hidden lg:flex lg:flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ${
        collapsed ? 'lg:w-20' : 'lg:w-72'
      } ${scrollable ? 'lg:h-full lg:overflow-y-auto custom-scrollbar' : ''}`}
    >
      <div className="w-full flex flex-col">
        {/* User card + collapse toggle */}
        <div className={`${collapsed ? 'p-3' : 'p-6'} border-b border-gray-50 dark:border-gray-800 transition-all duration-300`}>
          <div className={`flex items-center ${collapsed ? 'flex-col gap-2 justify-center p-2' : 'gap-4 p-3'} bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm`}>
            <div
              className={`rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center font-black text-white shadow-lg shadow-primary-600/20 flex-shrink-0 transition-all duration-300 ${
                collapsed ? 'w-10 h-10 text-base' : 'w-12 h-12 text-xl'
              }`}
              title={userName}
            >
              {userName?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <p className="font-bold text-gray-900 dark:text-white truncate">{userName}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-600">{userRole}</p>
              </div>
            )}
            <button
              type="button"
              onClick={onToggle}
              title={collapsed ? `Expand ${menuLabel}` : `Collapse ${menuLabel}`}
              aria-label={collapsed ? `Expand ${menuLabel}` : `Collapse ${menuLabel}`}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition shadow-sm"
            >
              {collapsed ? '»' : '«'}
            </button>
          </div>
        </div>

        {/* Links */}
        <nav className={`${collapsed ? 'p-2' : 'p-4'} flex flex-1 flex-col min-h-0 transition-all duration-300`}>
          <div className="space-y-1.5 flex-1">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                title={collapsed ? link.label : undefined}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'justify-center px-2 py-3' : 'gap-4 px-4 py-3.5'} rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:translate-x-1'
                  }`
                }
              >
                <span className="text-lg flex-shrink-0">{link.icon}</span>
                {!collapsed && <span className="truncate">{link.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default CollapsibleSidebar
