const API_URL = "http://194.67.92.55:8000/api"

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

export const getFiles = async (userId = null) => {
  const url = userId 
    ? `http://194.67.92.55:8000/api/files/?user_id=${userId}`
    : `http://194.67.92.55:8000/api/files/`;
    
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Ошибка при получении файлов');
  return response.json();
};

export const toggleAdminStatus = async (userId) => {
  const response = await fetch(`http://194.67.92.55:8000/api/admin/users/${userId}/toggle_admin/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка изменения статуса администратора');
  }
  return response.json();
};