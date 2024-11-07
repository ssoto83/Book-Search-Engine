import { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../utils/mutations';
import Auth from '../utils/auth';

const SignupForm = () => {
  // set initial form state
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  
  // state for form validation
  const [validated, setValidated] = useState(false);
  
  // state for alert visibility
  const [showAlert, setShowAlert] = useState(false);

  // state for loading state
  const [loading, setLoading] = useState(false);

  // handle mutation for adding user
  const [addUser, { error }] = useMutation(ADD_USER);

  // handle error visibility
  useEffect(() => {
    if (error) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [error]);

  // handle form input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  // handle form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true); // show validation feedback if invalid
    } else {
      setLoading(true);  // start loading state when submitting
      try {
        const { data } = await addUser({
          variables: { ...userFormData },  // pass form data to mutation
        });
        console.log(data); // Log the data returned from the mutation
        Auth.login(data.addUser.token);  // login the user by storing token
        setUserFormData({ username: '', email: '', password: '' });  // clear form after successful submission
      } catch (err) {
        console.error(err);
        setShowAlert(true);  // show error alert on failure
      }
      setLoading(false);  // stop loading state after submitting
    }
  };

  return (
    <>
      {/* Form with validation */}
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        
        {/* Alert if signup fails */}
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant="danger">
          Something went wrong with your signup!
        </Alert>

        {/* Username field */}
        <Form.Group className="mb-3">
          <Form.Label htmlFor="username">Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your username"
            name="username"
            onChange={handleInputChange}
            value={userFormData.username}
            required
          />
          <Form.Control.Feedback type="invalid">
            Username is required!
          </Form.Control.Feedback>
        </Form.Group>

        {/* Email field */}
        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Your email address"
            name="email"
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type="invalid">
            Email is required!
          </Form.Control.Feedback>
        </Form.Group>

        {/* Password field */}
        <Form.Group className="mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Your password"
            name="password"
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type="invalid">
            Password is required!
          </Form.Control.Feedback>
        </Form.Group>

        {/* Submit button */}
        <Button
          disabled={loading || !(userFormData.username && userFormData.email && userFormData.password)}
          type="submit"
          variant="success"
        >
          {loading ? 'Signing Up...' : 'Submit'}
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
