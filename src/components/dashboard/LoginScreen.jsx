import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCycle } from '../../context/CycleContext';
import './LoginScreen.css';

export default function LoginScreen() {
  const { dispatch } = useCycle();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    if (password === '05112025') {
      dispatch({ type: 'LOGIN', payload: { name: 'Darine' } });
      setError('');
      navigate('/', { replace: true });
    } else {
      setError('Wrong anniversary date! Try again, babe 💕');
      setPassword('');
    }
  };

  return (
    <div className="login-screen" id="login-screen">
      <div className="login-greeting">
        <h1 className="text-hero">Welcome, the prettiest girl ever exist, Darine! ✨</h1>
        <p className="text-body" style={{ marginTop: 'var(--space-md)' }}>
          If you wanna start to login to the app please input our anniversary date.
        </p>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <label className="form-label" htmlFor="password">Our Anniversary (DDMMYYYY)</label>
        <input
          id="password"
          className="input-field"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error-message" style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}

