import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  username: null,
  isAdmin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.username = action.payload.username;
      state.isAdmin = action.payload.is_staff;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.username = null;
      state.isAdmin = false;
    },
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;