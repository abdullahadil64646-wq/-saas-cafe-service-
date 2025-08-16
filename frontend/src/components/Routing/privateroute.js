import React, { useContext } from 'react';
import { Route, Redirect,Nevigate } from 'react-router-dom';
import { AuthContext } from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src\context/AuthContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <div className="text-center my-5">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;