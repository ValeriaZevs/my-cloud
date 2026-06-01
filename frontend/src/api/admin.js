const API_URL = "/api";

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/admin/users/`);
  if (!response.ok) throw new Error('Ошибка доступа (возможно, вы не администратор)');
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Ошибка при удалении пользователя');
  return true;
};

export const getFiles = async (userId = null) => {
  const url = userId
    ? `${API_URL}/files/?user_id=${userId}`
    : `${API_URL}/files/`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Ошибка при получении файлов');
  return response.json();
};

export const toggleAdminStatus = async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/toggle_admin/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка изменения статуса администратора');
  }
  return response.json();
};