import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../api/admin';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const handleDelete = async (id, username) => {
    if (window.confirm(`Вы уверены, что хотите НАВСЕГДА удалить пользователя ${username} и все его файлы?`)) {
      try {
        await deleteUser(id);
        await fetchUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2>Панель Администратора 🛡️</h2>
        <Link to="/dashboard" style={{ padding: '8px 15px', background: '#0066cc', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Вернуться в Облако
        </Link>
      </header>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Логин</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Email</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Статус</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Файлы (шт / размер)</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}><strong>{user.username}</strong></td>
              <td style={{ padding: '12px' }}>{user.email}</td>
              <td style={{ padding: '12px', color: user.is_staff ? 'green' : 'black' }}>
                {user.is_staff ? 'Админ' : 'Пользователь'}
              </td>
              <td style={{ padding: '12px' }}>
                {user.file_count} шт. / {(user.total_size / 1024).toFixed(1)} KB
              </td>
              <td style={{ padding: '12px' }}>
                {!user.is_staff && (
                  <button onClick={() => handleDelete(user.id, user.username)} style={{ padding: '6px 12px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Удалить
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;