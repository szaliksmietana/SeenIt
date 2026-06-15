import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieList from './pages/MovieList';
import MovieDetails from './pages/MovieDetails';
import MovieForm from './pages/MovieForm';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          {/* Publiczne */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dostępne dla każdego zalogowanego */}
          <Route element={<PrivateRoute />}>
            <Route path="/movies" element={<MovieList />} />
            <Route path="/movies/:id" element={<MovieDetails />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Panel CMS — tylko admin może dodawać i edytować */}
          <Route element={<AdminRoute />}>
            <Route path="/movies/add" element={<MovieForm mode="create" />} />
            <Route path="/movies/:id/edit" element={<MovieForm mode="edit" />} />
          </Route>

          <Route path="/" element={<Navigate to="/movies" replace />} />
          <Route path="*" element={<Navigate to="/movies" replace />} />
        </Routes>
      </main>
    </>
  );
}
