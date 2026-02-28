import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('dw_token');
    localStorage.removeItem('dw_user');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-accent">d-</span>watson
        </div>
        <nav className="nav">
          <NavLink to="/" end className="nav-item">
            Dashboard
          </NavLink>
          <NavLink to="/projects" className="nav-item">
            Projects
          </NavLink>
          <NavLink to="/inflows" className="nav-item">
            Cash Inflows
          </NavLink>
          <NavLink to="/expenses" className="nav-item">
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

