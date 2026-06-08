import {createSlice} from '@reduxjs/toolkit'

const SESSION_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

const loadUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo');

  if (!storedUserInfo) {
    return null;
  }

  try {
    const parsedUserInfo = JSON.parse(storedUserInfo);

    if (parsedUserInfo.expiresAt && parsedUserInfo.expiresAt <= Date.now()) {
      localStorage.removeItem('userInfo');
      return null;
    }

    return parsedUserInfo;
  } catch (err) {
    localStorage.removeItem('userInfo');
    return null;
  }
};

const initialState = {
  userInfo: loadUserInfo(),
}

const authSlice = createSlice ({
  name : 'auth',
  initialState, 
  reducers : {
    setCredentials: (state, action) => {
      const userInfo = {
        ...action.payload,
        expiresAt: Date.now() + SESSION_MAX_AGE_MS,
      };

      state.userInfo = userInfo;
      localStorage.setItem ('userInfo', JSON.stringify(userInfo)); 
    },
    logout : (state, action) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo'); 
    }
  }
})

export const { setCredentials, logout } = authSlice.actions; 

export default authSlice.reducer;
