import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { useResetPasswordMutation } from '../slices/usersApiSlice';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { token } = useParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const res = await resetPassword({ token, password }).unwrap();
      toast.success(res.message);
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className='py-3'>
      <FormContainer>
        <h1>Reset Password</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='password' className='my-3'>
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Enter new password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='new-password'
              required
            />
          </Form.Group>

          <Form.Group controlId='confirmPassword' className='my-3'>
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Confirm new password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete='new-password'
              required
            />
          </Form.Group>

          <Button type='submit' variant='primary' className='my-2' disabled={isLoading}>
            Reset Password
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

export default ResetPasswordScreen;
