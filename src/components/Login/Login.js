import React, { useState } from 'react';
import './Login.css';
import { supabase } from '../../services/database';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Kérjük töltsd ki mindkét mezőt!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Bejelentkezési kísérlet:', formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Bejelentkezési hiba:', error);
        throw error;
      }

      if (data.user) {
        console.log('Sikeres bejelentkezés:', data.user.email);
        onLogin(data.user);
      }
    } catch (error) {
      console.error('Bejelentkezés sikertelen:', error);
      setError(error.message || 'Hibás email vagy jelszó!');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: 'muczaj9@gmail.com',
      password: 'mTazH74@'
    });
    
    setLoading(true);
    setError('');

    try {
      console.log('Demo bejelentkezési kísérlet...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'muczaj9@gmail.com',
        password: 'mTazH74@',
      });

      if (error) {
        console.error('Demo bejelentkezési hiba:', error);
        throw error;
      }

      if (data.user) {
        console.log('Sikeres demo bejelentkezés');
        onLogin(data.user);
      }
    } catch (error) {
      console.error('Demo bejelentkezés sikertelen:', error);
      setError('Demo bejelentkezés sikertelen. Kérjük próbáld meg manuálisan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">AirPods Sales System</h1>
          <p className="login-subtitle">Kérjük jelentkezz be a folytatáshoz</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email cím</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="pelda@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Jelszó</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <strong>Hiba:</strong> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Bejelentkezés...
              </>
            ) : (
              '🔐 Bejelentkezés'
            )}
          </button>
        </form>
        <div className="login-footer">
          <p className="security-notice">
            🔒 Biztonságos bejelentkezés • Csak hitelesített felhasználók számára
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;