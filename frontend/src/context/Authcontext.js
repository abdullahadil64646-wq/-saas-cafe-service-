import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  cafe: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
        cafe: action.payload.cafe
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'REGISTER_FAIL':
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        cafe: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios default headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['x-auth-token'] = state.token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [state.token]);

  // Load user data on initial load
  useEffect(() => {
    const loadUser = async () => {
      if (!state.token) {
        dispatch({ type: 'AUTH_ERROR' });
        return;
      }

      try {
        const userRes = await axios.get('/api/auth/me');
        const cafeRes = await axios.get('/api/cafes/me');
        
        dispatch({
          type: 'USER_LOADED',
          payload: { user: userRes.data, cafe: cafeRes.data }
        });
      } catch (err) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    if (state.loading) {
      loadUser();
    }
  }, [state.loading, state.token]);

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });

      // Load user data after registration
      const userRes = await axios.get('/api/auth/me');
      const cafeRes = await axios.get('/api/cafes/me');
      
      dispatch({
        type: 'USER_LOADED',
        payload: { user: userRes.data, cafe: cafeRes.data }
      });
      
      return { success: true };
    } catch (err) {
      const errors = err.response?.data?.errors || [{ msg: err.response?.data?.msg || 'Server error' }];
      
      dispatch({
        type: 'REGISTER_FAIL'
      });
      
      return { success: false, errors };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      // Load user data after login
      const userRes = await axios.get('/api/auth/me');
      const cafeRes = await axios.get('/api/cafes/me');
      
      dispatch({
        type: 'USER_LOADED',
        payload: { user: userRes.data, cafe: cafeRes.data }
      });
      
      return { success: true };
    } catch (err) {
      const errors = err.response?.data?.errors || [{ msg: err.response?.data?.msg || 'Invalid credentials' }];
      
      dispatch({
        type: 'LOGIN_FAIL'
      });
      
      return { success: false, errors };
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        cafe: state.cafe,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};