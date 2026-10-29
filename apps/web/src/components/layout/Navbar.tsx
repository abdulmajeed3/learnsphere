import { Link, NavLink } from 'react-router-dom';
import { BookOpen, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks =
    user?.role === 'INSTRUCTOR'
      ? [
          { to: '/instructor/dashboard', label: 'Dashboard' },
          { to: '/instructor/courses', label: 'My Courses' },
          { to: '/courses', label: 'Catalog' },
        ]
      : [
          { to: '/courses', label: 'Catalog' },
          ...(isAuthenticated ? [{ to: '/student/dashboard', label: 'Dashboard' }] : []),
        ];

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary-700 text-lg">
            <BookOpen className="h-6 w-6" />
            LearnSphere
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  <User className="h-4 w-4" />
                  {user?.name}
                </Link>
                <button
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="btn-ghost text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4 pt-2">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => { logout.mutate(); setMobileOpen(false); }}
              className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-gray-600"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          ) : (
            <div className="mt-2 flex gap-2">
              <Link to="/login" className="btn-secondary flex-1 text-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-primary flex-1 text-sm" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
