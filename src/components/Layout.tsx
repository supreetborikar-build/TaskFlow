import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, CheckSquare, Layers, 
  Users, Calendar, BarChart3, FileSpreadsheet, Bell, 
  Settings, Sun, Moon, Search, Plus, Menu, X, User
} from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { UserAvatar } from './UserAvatar';

export const Layout: React.FC = () => {
  const { 
    theme, toggleTheme, searchQuery, setSearchQuery, 
    notifications, markNotificationRead, markAllNotificationsRead, 
    currentUserId, team
  } = useProjectStore();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentUser = team.find(t => t.id === currentUserId);
  const unreadNotifications = notifications.filter(n => !n.read);

  // Apply dark theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Sprint Board', path: '/sprint', icon: Layers },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications.length },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const segment = path.split('/')[1];
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // If not on tasks or projects, maybe redirect to tasks
    if (location.pathname !== '/tasks' && location.pathname !== '/projects' && location.pathname !== '/') {
      navigate('/tasks');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const closeDropdowns = () => {
      setNotifDropdownOpen(false);
      setProfileDropdownOpen(false);
      setQuickAddOpen(false);
    };
    window.addEventListener('click', closeDropdowns);
    return () => window.removeEventListener('click', closeDropdowns);
  }, []);

  return (
    <div className="min-h-screen flex bg-enterprise-bg dark:bg-dark-bg text-enterprise-textPrimary dark:text-dark-textPrimary">
      {/* Sidebar - Desktop */}
      <aside className="w-[280px] bg-white dark:bg-dark-card border-r border-enterprise-border dark:border-dark-border hidden lg:flex flex-col fixed h-screen z-20">
        {/* Sidebar Header */}
        <div className="h-[72px] px-6 border-b border-enterprise-border dark:border-dark-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
            T
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight text-enterprise-textPrimary dark:text-dark-textPrimary">
              TechFlow
            </h1>
            <span className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary">
              Enterprise Workspace
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1">{link.name}</span>
                {link.badge && link.badge > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent text-white shrink-0">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-enterprise-border dark:border-dark-border bg-slate-50 dark:bg-slate-900/30 flex items-center gap-3">
          <UserAvatar name={currentUser?.name} className="w-10 h-10" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary truncate">
              {currentUser?.name}
            </h2>
            <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary truncate">
              {currentUser?.role}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[280px] flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-[72px] bg-white dark:bg-dark-card border-b border-enterprise-border dark:border-dark-border flex items-center justify-between px-6 sticky top-0 z-10 no-print">
          {/* Left: Mobile Menu Trigger + Search */}
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <button 
              onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}
              className="p-2 -ml-2 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-enterprise-textSecondary dark:text-dark-textSecondary"
            >
              <Menu size={20} />
            </button>
            
            <div className="relative w-full max-w-xs md:max-w-sm hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-enterprise-textMuted dark:text-dark-textMuted">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search projects or tasks..."
                className="w-full pl-9 pr-4 py-2 border border-enterprise-border dark:border-dark-border rounded-lg bg-slate-50 dark:bg-slate-900/50 text-sm focus:bg-white dark:focus:bg-dark-card transition-colors focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

          {/* Right: Quick Add + Notifications + Dark Mode + User */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Quick Add Button */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setQuickAddOpen(!quickAddOpen); setNotifDropdownOpen(false); setProfileDropdownOpen(false); }}
                className="quick-add-btn flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors duration-150"
              >
                <Plus size={14} />
                <span className="hidden md:inline">Quick Add</span>
              </button>
              
              {quickAddOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-lg shadow-modal py-1 text-sm z-30 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => { setQuickAddOpen(false); navigate('/tasks?add=true'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-enterprise-textPrimary dark:text-dark-textPrimary flex items-center gap-2"
                  >
                    <CheckSquare size={14} />
                    Create Task
                  </button>
                  <button 
                    onClick={() => { setQuickAddOpen(false); navigate('/projects?add=true'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-enterprise-textPrimary dark:text-dark-textPrimary flex items-center gap-2"
                  >
                    <FolderKanban size={14} />
                    Create Project
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="dark-mode-toggle p-2 rounded-lg border border-enterprise-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-enterprise-textSecondary dark:text-dark-textSecondary transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setNotifDropdownOpen(!notifDropdownOpen); setProfileDropdownOpen(false); setQuickAddOpen(false); }}
                className="notification-bell p-2 rounded-lg border border-enterprise-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-enterprise-textSecondary dark:text-dark-textSecondary relative transition-colors"
              >
                <Bell size={18} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger"></span>
                )}
              </button>

              {notifDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-lg shadow-modal z-30 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-enterprise-border dark:border-dark-border flex items-center justify-between">
                    <span className="font-semibold text-xs text-enterprise-textPrimary dark:text-dark-textPrimary">
                      Notifications ({unreadNotifications.length})
                    </span>
                    {unreadNotifications.length > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-[10px] text-accent hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-enterprise-border dark:divide-dark-border">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-enterprise-textMuted dark:text-dark-textMuted">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!n.read ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`font-semibold ${n.severity === 'high' ? 'text-danger' : n.severity === 'medium' ? 'text-warning' : 'text-enterprise-textPrimary dark:text-dark-textPrimary'}`}>
                              {n.title}
                            </span>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1"></span>}
                          </div>
                          <p className="text-enterprise-textSecondary dark:text-dark-textSecondary mt-1 leading-normal">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-enterprise-textMuted dark:text-dark-textMuted block mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-enterprise-border dark:border-dark-border text-center">
                    <button 
                      onClick={() => { setNotifDropdownOpen(false); navigate('/notifications'); }}
                      className="text-xs text-enterprise-textSecondary dark:text-dark-textSecondary hover:text-enterprise-textPrimary dark:hover:text-dark-textPrimary font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); setNotifDropdownOpen(false); setQuickAddOpen(false); }}
                className="w-8 h-8 rounded-full overflow-hidden border border-enterprise-border dark:border-dark-border object-cover object-center shrink-0 cursor-pointer"
              >
                <UserAvatar name={currentUser?.name} className="w-8 h-8" />
              </button>

              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card border border-enterprise-border dark:border-dark-border rounded-lg shadow-modal py-1 z-30 animate-fade-in text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2.5 border-b border-enterprise-border dark:border-dark-border">
                    <p className="font-semibold text-xs text-enterprise-textPrimary dark:text-dark-textPrimary truncate">{currentUser?.name}</p>
                    <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary truncate">{currentUser?.email}</p>
                  </div>
                  <button 
                    onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-enterprise-textPrimary dark:text-dark-textPrimary flex items-center gap-2"
                  >
                    <User size={14} />
                    My Profile Settings
                  </button>
                  <div className="border-t border-enterprise-border dark:border-dark-border my-1"></div>
                  <div className="px-4 py-2 text-[10px] text-enterprise-textMuted dark:text-dark-textMuted">
                    Active workspace: <span className="font-semibold text-enterprise-textSecondary dark:text-dark-textSecondary">Default Co.</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-grow p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {/* Breadcrumbs (for premium feel) */}
          <div className="mb-6 flex items-center gap-1.5 text-xs text-enterprise-textSecondary dark:text-dark-textSecondary no-print">
            <span className="hover:text-enterprise-textPrimary dark:hover:text-dark-textPrimary cursor-pointer" onClick={() => navigate('/')}>
              Home
            </span>
            <span>/</span>
            <span className="font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary">
              {getBreadcrumb()}
            </span>
          </div>

          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Slide-out Drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-[280px] bg-white dark:bg-dark-card border-r border-enterprise-border dark:border-dark-border h-full flex flex-col animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-[72px] px-6 border-b border-enterprise-border dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  T
                </div>
                <div>
                  <h1 className="font-semibold text-sm leading-tight text-enterprise-textPrimary dark:text-dark-textPrimary">
                    TechFlow
                  </h1>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-enterprise-textSecondary dark:text-dark-textSecondary"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="flex-1">{link.name}</span>
                    {link.badge && link.badge > 0 ? (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent text-white shrink-0">
                        {link.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-enterprise-border dark:border-dark-border bg-slate-50 dark:bg-slate-900/30 flex items-center gap-3">
              <UserAvatar name={currentUser?.name} className="w-10 h-10" />
              <div className="min-w-0 flex-grow">
                <h2 className="text-xs font-semibold text-enterprise-textPrimary dark:text-dark-textPrimary truncate">
                  {currentUser?.name}
                </h2>
                <p className="text-[10px] text-enterprise-textSecondary dark:text-dark-textSecondary truncate">
                  {currentUser?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Layout;
