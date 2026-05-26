const API_URL = 'http://194.67.92.55:8000/';

const getCsrfToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrftoken=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
};

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/admin/users/`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Ошибка доступа (возможно, вы не администратор)');
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRFToken': getCsrfToken() },
  });
  if (!response.ok) throw new Error('Ошибка при удалении пользователя');
  return true;
};