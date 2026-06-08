import { useState, useEffect } from 'react';
import {Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import  FormContainer  from '../components/FormContainer';
import Loader from '../components/Loader';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { toast } from 'react-toastify';
import { Container } from 'react-bootstrap';
import Message from '../components/Message';

const RegisterScreen = () => {
  const [ username, setName ] = useState('')
  const [ email, setEmail ] = useState('')
  const [ mobileNumber, setMobileNumber ] = useState('')
  const [ password, setPassword ] = useState ('')
  const [ confirmPassword, setConfirmPassword ] = useState ('')
  const [ verificationMessage, setVerificationMessage ] = useState('')
  const [ verificationUrl, setVerificationUrl ] = useState('')

  const navigate = useNavigate();

  const [register, {isLoading}] = useRegisterMutation(); 

  const {userInfo} = useSelector((state) => state.auth); 

  const { search } = useLocation();
  const sp = new URLSearchParams(search); 
  const redirect = sp.get('redirect')  || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [userInfo, redirect, navigate]);

   
  const submitHandler = async (e) => {
    e.preventDefault ();

    if (password !== confirmPassword) {
      toast.error('Password do not match');
      return;
    } else {
       try {
      const res = await register({username, email, mobileNumber, password}).unwrap();
      setVerificationMessage(res.message);
      setVerificationUrl(res.verificationUrl || '');
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data.message || err.error);
    }
    }   
  };

  return (
    <Container className="py-3">
      <FormContainer>
        <h1>
          Sign Up
        </h1>
        {verificationMessage && (
          <Message variant='success'>
            {verificationMessage}
            {verificationUrl && (
              <>
                {' '}
                <a href={verificationUrl}>Open verification link</a>
              </>
            )}
          </Message>
        )}
        <Form onSubmit = {submitHandler} autoComplete='off'>

          <Form.Group controlId = 'username' className='my-3'>
            <Form.Label>
              Username 
            </Form.Label>
            <Form.Control
              type='text'
              autoComplete='off'
              placeholder='Enter username'
              value={username}
              onChange={(e) => setName(e.target.value)}>
            </Form.Control>
          </Form.Group>
          
          <Form.Group controlId = 'email' className='my-3'>
            <Form.Label>
              Email Address 
            </Form.Label>
            <Form.Control
              type='email'
              autoComplete='off'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId = 'mobileNumber' className='my-3'>
            <Form.Label>
              Mobile Number
            </Form.Label>
            <Form.Control
              type='tel'
              autoComplete='tel'
              placeholder='Enter mobile number'
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId = 'password' className='my-3'>
            <Form.Label>
              Password 
            </Form.Label>
            <Form.Control
              type='password'
              autoComplete='new-password'
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId = 'confirmPassword' className='my-3'>
            <Form.Label>
              Confirm Password 
            </Form.Label>
            <Form.Control
              type='password'
              autoComplete='new-password'
              placeholder='Confirm password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword (e.target.value)}>
            </Form.Control>
          </Form.Group>

          <Button type='submit' variant='primary' className='my-3' disabled={isLoading}>
            Register
          </Button>

          { isLoading && <Loader/>}

        </Form>

        <Row className='py-3'>
          <Col>
          Already have an acount? <Link to={ redirect ? `/login?redirect=${redirect}`:'login'}>Login </Link>
          </Col>
        </Row> 

      </FormContainer>
    </Container>  
  )
}

export default RegisterScreen;
