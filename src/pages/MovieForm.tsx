import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { moviesApi, Movie } from '../api/services';

interface Props {
  mode: 'create' | 'edit';
}

type FormData = Omit<Movie, 'id' | 'avg_rating'>;

export default function MovieForm({ mode }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { media_type: 'movie' },
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      moviesApi.get(Number(id)).then((m) => reset(m)).catch(() => toast.error('Błąd ładowania'));
    }
  }, [mode, id]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const payload = {
      ...data,
      year: Number(data.year),
      duration_minutes: data.duration_minutes ? Number(data.duration_minutes) : null,
    };
    try {
      if (mode === 'create') {
        const created = await moviesApi.create(payload);
        toast.success('Film dodany');
        navigate(`/movies/${created.id}`);
      } else {
        await moviesApi.update(Number(id), payload);
        toast.success('Zapisano zmiany');
        navigate(`/movies/${id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Błąd zapisu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h1>{mode === 'create' ? 'Dodaj film / serial' : 'Edytuj'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label>Tytuł *</label>
          <input {...register('title', {
            required: 'Tytuł jest wymagany',
            maxLength: { value: 200, message: 'Maksymalnie 200 znaków' },
          })} />
          {errors.title && <span className="error">{errors.title.message}</span>}
        </div>

        <div className="field-row">
          <div className="field">
            <label>Rok *</label>
            <input type="number" {...register('year', {
              required: 'Rok jest wymagany',
              min: { value: 1888, message: 'Najwcześniej 1888' },
              max: { value: 2100, message: 'Zbyt odległy rok' },
            })} />
            {errors.year && <span className="error">{errors.year.message}</span>}
          </div>

          <div className="field">
            <label>Typ</label>
            <select {...register('media_type')}>
              <option value="movie">Film</option>
              <option value="series">Serial</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Reżyser</label>
          <input {...register('director')} />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Gatunek</label>
            <input {...register('genre')} />
          </div>
          <div className="field">
            <label>Czas (min)</label>
            <input type="number" {...register('duration_minutes', {
              min: { value: 1, message: 'Musi być dodatni' },
            })} />
            {errors.duration_minutes && <span className="error">{errors.duration_minutes.message}</span>}
          </div>
        </div>

        <div className="field">
          <label>Kraj</label>
          <input {...register('country')} />
        </div>

        <div className="field">
          <label>Opis</label>
          <textarea rows={4} {...register('description')} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn" onClick={() => navigate(-1)}>Anuluj</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </div>
      </form>
    </div>
  );
}
