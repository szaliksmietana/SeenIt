import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/movies" className="navbar-brand">🎬 CineVault</Link>
      {user && (
        <div className="navbar-links">
          <Link to="/movies">Filmy</Link>
          <Link to="/movies/add">Dodaj</Link>
          <Link to="/watchlist">Do obejrzenia</Link>
          <Link to="/profile">Profil</Link>
          <span className="navbar-user">{user.username}</span>
          <button onClick={handleLogout} className="btn btn-sm">Wyloguj</button>
        </div>
      )}
    </nav>
  );
}
