import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      await login(data.username, data.password);
      toast.success('Zalogowano!');
      navigate('/movies');
    } catch (err: any) {
      toast.error(err.message || 'Błąd logowania');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Logowanie</h1>
      <p className="hint">Konto demo: <strong>demo</strong> / <strong>Demo1234</strong></p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label>Nazwa użytkownika</label>
          <input
            {...register('username', { required: 'Pole wymagane' })}
            autoComplete="username"
          />
          {errors.username && <span className="error">{errors.username.message}</span>}
        </div>

        <div className="field">
          <label>Hasło</label>
          <input
            type="password"
            {...register('password', { required: 'Pole wymagane' })}
            autoComplete="current-password"
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>
      <p className="switch">Nie masz konta? <Link to="/register">Zarejestruj się</Link></p>
    </div>
  );
}
