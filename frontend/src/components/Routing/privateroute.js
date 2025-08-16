import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/Authcontext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;