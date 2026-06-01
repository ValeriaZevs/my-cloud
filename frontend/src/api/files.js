const API_URL = "/api";

export const getFiles = async (userId = null) => {
  const url = userId
    ? `${API_URL}/files/?user_id=${userId}`
    : `${API_URL}/files/`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Ошибка при получении списка файлов');
  return response.json();
};

export const logoutUser = async () => {
  const refresh = localStorage.getItem('refresh');

  if (refresh) {
    try {
      await fetch(`${API_URL}/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
    } catch (e) {
      console.error(e);
    }
  }

  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};

export const uploadFile = async (file, comment) => {
  const formData = new FormData();
  formData.append('file', file);
  if (comment) {
    formData.append('comment', comment);
  }

  const response = await fetch(`${API_URL}/files/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка при загрузке');
  }
  return response.json();
};

export const deleteFile = async (fileId) => {
  const response = await fetch(`${API_URL}/files/${fileId}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Ошибка при удалении файла');
  return true;
};

export const updateFile = async (fileId, data) => {
  const response = await fetch(`${API_URL}/files/${fileId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Ошибка при обновлении файла');
  return response.json();
};

export const getShareLink = async (fileId) => {
  const response = await fetch(`${API_URL}/files/${fileId}/share/`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('Ошибка при генерации ссылки');
  return response.json();
};

export const getAdminUsers = async () => {
  const response = await fetch(`${API_URL}/admin/users/`);
  if (!response.ok) throw new Error('Ошибка при получении списка пользователей');
  return response.json();
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/admin/users/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Ошибка при удалении пользователя');
  return true;
};

export const toggleAdminStatus = async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/toggle_admin/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ошибка изменения статуса администратора');
  }
  return response.json();
};