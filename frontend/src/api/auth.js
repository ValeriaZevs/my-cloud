const API_URL = 'http://localhost:8000/api';

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', 
    body: JSON.stringify({ username, password }),
  });
  return response.json();
};

export const registerUser = async (username, email, password) => {
  const response = await fetch(`${API_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // И здесь тоже
    body: JSON.stringify({ username, email, password }),
  });
  return response.json();
};