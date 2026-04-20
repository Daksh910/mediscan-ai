import { useState } from 'react';
import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FilePlus, LogOut, Activity, Upload, Menu, X, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
  { path: '/patients',    label: 'Patients',        icon: Users },
  { path: '/assessment',  label: 'New Assessment',  icon: FilePlus },
  { path: '/bulk-import', label: 'Bulk Import',     icon: Upload },
  { path: '/profile',     label: 'My Profile',      icon: User },
];

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: 'hsl(158 42% 22%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px hsl(158 42% 22% / 0.3)',
      flexShrink: 0,
    }}>
      <Activity size={17} color="white" />
    </div>
    <div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, fontSize: 15, color: 'hsl(210 15% 12%)' }}>MediScan AI</div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'hsl(210 8% 58%)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Clinical Intelligence</div>
    </div>
  </div>
);

const NavContent = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    onClose?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid hsl(34 18% 88%)' }}>
        <Logo />
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="section-label" style={{ padding: '8px 10px 6px', marginTop: 4 }}>Navigation</div>
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <RouterNavLink
              key={path} to={path} onClick={onClose}
              className={`nav-link${active ? ' active' : ''}`}
            >
              <Icon size={16} />
              {label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </RouterNavLink>
          );
        })}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid hsl(34 18% 88%)' }}>
        {user.username && (
          <div style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'hsl(34 18% 95%)',
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(210 15% 12%)' }}>
              {user.role === 'doctor' ? 'Dr. ' : ''}{user.first_name || user.username}
            </div>
            <div style={{ fontSize: 11, color: 'hsl(210 8% 58%)', textTransform: 'capitalize', marginTop: 2 }}>
              {user.role} · {user.department || 'MediScan'}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(34 25% 97%)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex" style={{
        flexDirection: 'column', width: 224,
        minHeight: '100vh', position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }} className="sidebar hidden lg:flex">
        <NavContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
              className="lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50, width: 248 }}
              className="sidebar lg:hidden flex flex-col"
            >
              <div style={{ position: 'absolute', top: 16, right: 12 }}>
                <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'hsl(210 8% 58%)' }}>
                  <X size={18} />
                </button>
              </div>
              <NavContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Top Bar */}
        <header className="lg:hidden" style={{
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'hsl(0 0% 100%)',
          borderBottom: '1px solid hsl(34 18% 88%)',
        }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: '1px solid hsl(34 18% 88%)', cursor: 'pointer', padding: '7px 9px', borderRadius: 9 }}>
            <Menu size={17} color="hsl(210 10% 38%)" />
          </button>
          <Logo />
          <div style={{ width: 38 }} />
        </header>

        <main style={{ flex: 1, padding: '28px 28px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
