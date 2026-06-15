import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { watchlistApi, WatchlistItem } from '../api/services';

export default function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setItems(await watchlistApi.list());
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggle = async (id: number) => {
    await watchlistApi.toggleWatched(id);
    fetch();
  };

  const remove = async (id: number) => {
    await watchlistApi.remove(id);
    toast.success('Usunięto z listy');
    fetch();
  };

  if (loading) return <p className="loader">Ładowanie...</p>;

  return (
    <div>
      <h1>Do obejrzenia</h1>
      {items.length === 0 ? (
        <p className="empty">
          Lista jest pusta. <Link to="/movies">Przeglądaj filmy</Link> i dodawaj je tutaj.
        </p>
      ) : (
        <ul className="watchlist">
          {items.map((item) => (
            <li key={item.id} className={item.watched ? 'watched' : ''}>
              <input
                type="checkbox"
                checked={item.watched}
                onChange={() => toggle(item.id)}
              />
              <Link to={`/movies/${item.movie_id}`} className="watchlist-title">
                {item.movie.title} <span className="muted">({item.movie.year})</span>
              </Link>
              <button onClick={() => remove(item.id)} className="btn btn-sm btn-danger">Usuń</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
