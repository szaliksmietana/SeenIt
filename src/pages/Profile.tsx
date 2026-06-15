import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

interface ProfileForm {
  full_name: string;
  email: string;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { full_name: user?.full_name || '', email: user?.email || '' },
  });

  const onSubmit = async (data: ProfileForm) => {
    setSubmitting(true);
    try {
      await authApi.updateProfile(data);
      await refreshUser();
      toast.success('Profil zaktualizowany');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h1>Profil</h1>
      <p className="muted">Zalogowany jako <strong>{user?.username}</strong></p>
      <p className="muted">
        Rola: <strong>{user?.role === 'admin' ? 'Administrator' : 'Użytkownik'}</strong>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label>Imię i nazwisko</label>
          <input {...register('full_name')} />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" {...register('email', {
            required: 'Email jest wymagany',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Nieprawidłowy email' },
          })} />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </form>
    </div>
  );
}
