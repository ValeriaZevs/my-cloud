import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: localStorage.getItem('username') || null,
  isAdmin: localStorage.getItem('isAdmin') === 'true', 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.username = action.payload.username;
      state.isAdmin = action.payload.isAdmin;
      
      localStorage.setItem('username', action.payload.username);
      localStorage.setItem('isAdmin', action.payload.isAdmin);
    },
    logoutSuccess: (state) => {
      state.username = null;
      state.isAdmin = false;
      
      localStorage.removeItem('username');
      localStorage.removeItem('isAdmin');
    },
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;