import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { moviesApi, watchlistApi, Movie } from '../api/services';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moviesApi.get(Number(id))
      .then(setMovie)
      .catch(() => toast.error('Nie znaleziono filmu'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Na pewno usunąć ten film?')) return;
    await moviesApi.remove(Number(id));
    toast.success('Usunięto');
    navigate('/movies');
  };

  const handleAddToWatchlist = async () => {
    try {
      await watchlistApi.add(Number(id));
      toast.success('Dodano do listy do obejrzenia');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <p className="loader">Ładowanie...</p>;
  if (!movie) return <p className="empty">Nie znaleziono filmu.</p>;

  return (
    <div className="detail">
      <Link to="/movies" className="back-link">← Powrót do listy</Link>

      <div className="detail-header">
        <div className="detail-poster">{movie.media_type === 'series' ? '📺' : '🎬'}</div>
        <div>
          <h1>{movie.title}</h1>
          <p className="muted">
            {movie.year} · {movie.media_type === 'series' ? 'Serial' : 'Film'}
            {movie.duration_minutes && ` · ${movie.duration_minutes} min`}
          </p>
          {movie.avg_rating && <p className="rating-big">★ {movie.avg_rating} / 10</p>}
        </div>
      </div>

      <dl className="detail-info">
        <dt>Reżyser</dt><dd>{movie.director || '—'}</dd>
        <dt>Gatunek</dt><dd>{movie.genre || '—'}</dd>
        <dt>Kraj</dt><dd>{movie.country || '—'}</dd>
      </dl>

      {movie.description && <p className="detail-desc">{movie.description}</p>}

      <div className="detail-actions">
        <button onClick={handleAddToWatchlist} className="btn">+ Do obejrzenia</button>
        <Link to={`/movies/${movie.id}/edit`} className="btn">Edytuj</Link>
        <button onClick={handleDelete} className="btn btn-danger">Usuń</button>
      </div>
    </div>
  );
}
