import { Link, Outlet } from 'react-router-dom';
import './MainLayout.css';

function MainLayout() {
  return (
    <div className="layout">
      <nav className="nav-bar">
        <div className="nav-brand">Offstyle DB</div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Recent Records</Link>
          <Link to="/maps" className="nav-link">Map Leaderboards</Link>
          <Link to="/players" className="nav-link">Player Lookup</Link>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout; 