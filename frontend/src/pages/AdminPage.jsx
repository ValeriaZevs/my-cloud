import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminUsers, deleteUser } from '../api/files'; 
import { toggleAdminStatus } from '../api/files'; 

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId) => {
    try {
      await toggleAdminStatus(userId);
      alert('Статус администратора успешно изменен!');
      await fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Вы уверены, что хотите полностью удалить этого пользователя и его файлы?')) {
      try {
        await deleteUser(userId);
        await fetchUsers();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Панель администратора 👑</h2>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}>
        Назад в облако
      </button>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Логин</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Роль</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Файлы</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.username}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.email}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {user.is_staff ? 'Администратор' : 'Пользователь'}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <div>Кол-во: {user.file_count}</div>
                <div>Размер: {(user.total_size / 1024).toFixed(1)} KB</div>
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Кнопка перехода к просмотру файлов пользователя */}
                <button 
                  onClick={() => navigate(`/dashboard?user_id=${user.id}&username=${user.username}`)}
                  style={{ padding: '6px 12px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Просмотреть файлы
                </button>

                {/* Кнопка изменения прав */}
                <button 
                  onClick={() => handleToggleAdmin(user.id)}
                  style={{ padding: '6px 12px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {user.is_staff ? 'Снять права админа' : 'Сделать админом'}
                </button>

                {/* Кнопка удаления пользователя */}
                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  style={{ padding: '6px 12px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;