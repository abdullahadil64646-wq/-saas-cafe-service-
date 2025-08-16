import React, { createContext, useReducer } from 'react';

export const AlertContext = createContext();

const initialState = [];

let alertId = 0;

const alertReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ALERT':
      return [...state, action.payload];
    case 'REMOVE_ALERT':
      return state.filter(alert => alert.id !== action.payload);
    default:
      return state;
  }
};

export const AlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Set alert
  const setAlert = (msg, type = 'danger', timeout = 5000) => {
    const id = alertId++;
    
    dispatch({
      type: 'SET_ALERT',
      payload: { id, msg, type }
    });

    setTimeout(() => {
      dispatch({
        type: 'REMOVE_ALERT',
        payload: id
      });
    }, timeout);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts: state,
        setAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};