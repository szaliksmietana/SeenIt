import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../api/services';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    try {
      await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
        full_name: data.full_name || undefined,
      });
      toast.success('Konto utworzone! Możesz się zalogować.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Błąd rejestracji');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Rejestracja</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label>Nazwa użytkownika *</label>
          <input {...register('username', {
            required: 'Pole wymagane',
            minLength: { value: 3, message: 'Minimum 3 znaki' },
            pattern: { value: /^[a-zA-Z0-9_-]+$/, message: 'Tylko litery, cyfry, _ i -' },
          })} />
          {errors.username && <span className="error">{errors.username.message}</span>}
        </div>

        <div className="field">
          <label>Email *</label>
          <input type="email" {...register('email', {
            required: 'Pole wymagane',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Nieprawidłowy email' },
          })} />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="field">
          <label>Imię i nazwisko</label>
          <input {...register('full_name')} />
        </div>

        <div className="field">
          <label>Hasło *</label>
          <input type="password" {...register('password', {
            required: 'Pole wymagane',
            minLength: { value: 8, message: 'Minimum 8 znaków' },
            validate: {
              hasDigit: (v) => /\d/.test(v) || 'Hasło musi zawierać cyfrę',
              hasUpper: (v) => /[A-Z]/.test(v) || 'Hasło musi zawierać wielką literę',
            },
          })} />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <div className="field">
          <label>Powtórz hasło *</label>
          <input type="password" {...register('confirmPassword', {
            required: 'Pole wymagane',
            validate: (v) => v === password || 'Hasła nie są identyczne',
          })} />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Tworzenie...' : 'Utwórz konto'}
        </button>
      </form>
      <p className="switch">Masz już konto? <Link to="/login">Zaloguj się</Link></p>
    </div>
  );
}
