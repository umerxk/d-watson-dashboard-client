import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('dw_token');
    localStorage.removeItem('dw_user');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      <button
        type="button"
        className="hamburger-btn"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <span className="logo-accent">d-</span>watson
        </div>
        <nav className="nav">
          <NavLink to="/" end className="nav-item" onClick={closeSidebar}>
            Dashboard
          </NavLink>
          <NavLink to="/projects" className="nav-item" onClick={closeSidebar}>
            Projects
          </NavLink>
          <NavLink to="/inflows" className="nav-item" onClick={closeSidebar}>
            Cash Inflows
          </NavLink>
          <NavLink to="/expenses" className="nav-item" onClick={closeSidebar}>
            Expenses
          </NavLink>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Project cashflow overview</p>
          </div>
        </header>
        <section className="page-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

