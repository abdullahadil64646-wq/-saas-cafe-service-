import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/Authcontext';
import { AlertContext } from '../../context/Alertcontext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    cafeName: Yup.string()
      .required('Cafe name is required')
      .min(2, 'Cafe name must be at least 2 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    password2: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    
    const { name, email, password, cafeName, phone, location, instagram, facebook } = values;
    
    const formData = {
      name,
      email,
      password,
      cafeName,
      phone,
      location,
      instagram,
      facebook
    };
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        setAlert('Registration successful! Welcome to SaaS Cafe Service', 'success');
        history.push('/dashboard');
      } else {
        result.errors.forEach(error => setAlert(error.msg, 'danger'));
      }
    } catch (error) {
      setAlert('Registration failed. Please try again.', 'danger');
    }
    
    setIsLoading(false);
    setSubmitting(false);
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Register Your Cafe</h2>
              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  password2: '',
                  cafeName: '',
                  phone: '',
                  location: '',
                  instagram: '',
                  facebook: ''
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
                    <h5 className="mb-3">Account Information</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Your Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>

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

                    <Row>
                      <Col md={6}>
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
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password2"
                            value={values.password2}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.password2 && errors.password2}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.password2}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <hr />

                    <h5 className="mb-3">Cafe Information</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Cafe Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="cafeName"
                        value={values.cafeName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.cafeName && errors.cafeName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cafeName}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Location (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={values.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Instagram Handle (optional)</Form.Label>
                          <Form.Control
                            type="text"
                            name="instagram"
                            placeholder="@yourhandle"
                            value={values.instagram}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Facebook Page (optional)</Form.Label>
                          <Form.Control
                            type="text"
                            name="facebook"
                            placeholder="yourpage"
                            value={values.facebook}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mt-3"
                      disabled={isSubmitting || isLoading}
                    >
                      {isLoading ? 'Registering...' : 'Register'}
                    </Button>
                  </Form>
                )}
              </Formik>
              <div className="text-center mt-3">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;