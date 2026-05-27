import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import { loginUser, registerUser } from '../api/auth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateRegistration = () => {
  const loginRegex = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_=+-]).{6,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!loginRegex.test(username)) return "Логин должен быть от 4 до 20 символов, начинаться с буквы и содержать только латиницу и цифры.";
  if (!emailRegex.test(email)) return "Неверный формат email.";
  if (!passwordRegex.test(password)) return "Пароль (мин. 6 символов) должен содержать 1 заглавную букву, 1 цифру и 1 спецсимвол.";
  return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      const validationError = validateRegistration();
      if (validationError) {
        setError(validationError);
        return; 
      }
    }

    try {
      if (isLogin) {
        const data = await loginUser(username, password);
        if (data.error) throw new Error(data.error);
        
        dispatch(loginSuccess({
          username: data.username,
          isAdmin: data.is_staff 
        }));
        navigate('/dashboard'); 
      } else {
        const data = await registerUser(username, email, password);
        if (data.username) {
          setIsLogin(true); 
          setError('Регистрация успешна! Теперь войдите.');
        } else {
          const errorMsg = data.username ? 'Ошибка регистрации' : JSON.stringify(data);
          throw new Error(errorMsg); 
        }
      }
    } catch (err) {
      setError(err.message || 'Ошибка подключения к серверу');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>{isLogin ? 'Вход в MyCloud' : 'Регистрация'}</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '10px', fontSize: '16px' }}
          />
        )}
        
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>
          {isLogin ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>

      <button
        onClick={() => {
          setIsLogin(!isLogin);
          setError(''); 
        }}
        style={{ marginTop: '20px', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
      >
        {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войти'}
      </button>
    </div>
  );
};

export default AuthPage;