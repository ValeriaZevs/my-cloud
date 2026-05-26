const API_URL = 'http://194.67.92.55:8000';

const getCsrfToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrftoken=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
};

export const getFiles = async () => {
  const response = await fetch(`${API_URL}/files/`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Ошибка при загрузке файлов');
  return response.json();
};

export const logoutUser = async () => {
  const response = await fetch(`${API_URL}/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRFToken': getCsrfToken() },
  });
  return response.json();
};

export const uploadFile = async (file, comment) => {
  const formData = new FormData();
  formData.append('file', file);
  if (comment) {
    formData.append('comment', comment);
  }

  const response = await fetch(`${API_URL}/files/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRFToken': getCsrfToken() },
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
    credentials: 'include',
    headers: { 'X-CSRFToken': getCsrfToken() },
  });
  if (!response.ok) throw new Error('Ошибка при удалении файла');
  return true;
};

export const updateFile = async (fileId, data) => {
  const response = await fetch(`${API_URL}/files/${fileId}/`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrfToken()
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Ошибка при обновлении файла');
  return response.json();
};

export const getShareLink = async (fileId) => {
  const response = await fetch(`${API_URL}/files/${fileId}/share/`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) throw new Error('Ошибка при генерации ссылки');
  return response.json();
};