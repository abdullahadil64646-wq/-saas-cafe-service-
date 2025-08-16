import React, { useContext } from 'react';
import { Alert } from 'react-bootstrap';
import { AlertContext } from '../../context/Alertcontext';

const AlertComponent = () => {
  const { alerts } = useContext(AlertContext);

  return (
    <div className="alert-container">
      {alerts.map(alert => (
        <Alert key={alert.id} variant={alert.type} className="mb-3">
          {alert.msg}
        </Alert>
      ))}
    </div>
  );
};

export default AlertComponent;