import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moviesApi, Movie } from '../api/services';

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const fetchMovies = async () => {
    setLoading(true);
    const data = await moviesApi.list({
      search: search || undefined,
      media_type: type || undefined,
    });
    setMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchMovies, 300);
    return () => clearTimeout(t);
  }, [search, type]);

  return (
    <div>
      <div className="page-header">
        <h1>Filmy i seriale</h1>
        <Link to="/movies/add" className="btn btn-primary">+ Dodaj</Link>
      </div>

      <div className="filters">
        <input
          placeholder="Szukaj po tytule..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Wszystkie</option>
          <option value="movie">Filmy</option>
          <option value="series">Seriale</option>
        </select>
      </div>

      {loading ? (
        <p className="loader">Ładowanie...</p>
      ) : movies.length === 0 ? (
        <p className="empty">Brak wyników.</p>
      ) : (
        <div className="movie-grid">
          {movies.map((m) => (
            <Link to={`/movies/${m.id}`} key={m.id} className="movie-card">
              <div className="movie-card-poster">
                {m.media_type === 'series' ? '📺' : '🎬'}
              </div>
              <div className="movie-card-body">
                <h3>{m.title}</h3>
                <p className="muted">{m.year} · {m.genre}</p>
                {m.avg_rating && <span className="rating">★ {m.avg_rating}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
