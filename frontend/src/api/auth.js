const API_URL = "/api";

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok && data.access) {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
  }

  return data;
};

export const registerUser = async (username, email, password) => {
  const response = await fetch(`${API_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
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
    } catch (error) {
      console.error("Ошибка при логауте:", error);
    }
  }

  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};