import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src\context/AuthContext';
import { AlertContext } from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src\context\AlertContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    
    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        setAlert('Login successful! Welcome back.', 'success');
        history.push('/dashboard');
      } else {
        result.errors.forEach(error => setAlert(error.msg, 'danger'));
      }
    } catch (error) {
      setAlert('Login failed. Please try again.', 'danger');
    }
    
    setIsLoading(false);
    setSubmitting(false);
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Login</h2>
              <Formik
                initialValues={{
                  email: '',
                  password: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mt-3"
                      disabled={isSubmitting || isLoading}
                    >
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </Form>
                )}
              </Formik>
              <div className="text-center mt-3">
                Don't have an account? <Link to="/register">Register</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;