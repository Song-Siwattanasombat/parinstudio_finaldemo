import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useForgotPasswordMutation } from '../slices/usersApiSlice';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [message, setMessage] = useState('');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await forgotPassword({ email }).unwrap();
      setMessage(res.message);
      setResetUrl(res.resetUrl || '');
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className='py-3'>
      <FormContainer>
        <h1>Forgot Password</h1>
        {message && (
          <Message variant='success'>
            {message}
            {resetUrl && (
              <>
                {' '}
                <a href={resetUrl}>Open reset link</a>
              </>
            )}
          </Message>
        )}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='email' className='my-3'>
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Button type='submit' variant='primary' className='my-2' disabled={isLoading}>
            Send Reset Link
          </Button>

          {isLoading && <Loader />}
        </Form>
        <div className='py-3'>
          <Link to='/login'>Back to sign in</Link>
        </div>
      </FormContainer>
    </Container>
  );
};

export default ForgotPasswordScreen;
