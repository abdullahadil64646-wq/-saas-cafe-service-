import React from 'react';
import { Alert, Container, Row, Col, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="my-5">
          <Row className="justify-content-center">
            <Col md={8}>
              <Alert variant="danger" className="text-center">
                <Alert.Heading>Oops! Something went wrong</Alert.Heading>
                <p>
                  We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
                </p>
                <hr />
                <div className="d-flex justify-content-center">
                  <Button 
                    variant="outline-danger" 
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;