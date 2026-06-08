import { useState, useEffect } from 'react';
import {Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import  FormContainer  from '../components/FormContainer';
import Loader from '../components/Loader';
import {
  useGoogleLoginMutation,
  useLazyGetProfileQuery,
  useLoginMutation,
} from '../slices/usersApiSlice';
import {setCredentials} from '../slices/authSlice'
import { toast } from 'react-toastify';
import { Container } from 'react-bootstrap';
import Message from '../components/Message';

const LoginScreen = () => {
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState ('')
  const [ verificationMessage, setVerificationMessage ] = useState('')
  const [ verificationUrl, setVerificationUrl ] = useState('')

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, {isLoading}] = useLoginMutation(); 
  const [googleLogin, {isLoading: loadingGoogle}] = useGoogleLoginMutation();
  const [getProfile, {isLoading: loadingProfile}] = useLazyGetProfileQuery();

  const {userInfo} = useSelector((state) => state.auth); 

  const { search } = useLocation();
  const sp = new URLSearchParams(search); 
  const redirect = sp.get('redirect')  || '/';
  const emailVerified = sp.get('verified');
  const adminLogin = sp.get('adminLogin');
  const loginVerified = sp.get('login') || adminLogin;

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [userInfo, redirect, navigate]);

  useEffect(() => {
    const loadVerifiedLogin = async () => {
      if (loginVerified === 'success') {
        try {
          const res = await getProfile().unwrap();
          dispatch(setCredentials(res));
          navigate(redirect);
        } catch (err) {
          toast.error(err?.data?.message || err.error);
        }
      } else if (loginVerified === 'expired') {
        toast.error('Login confirmation link expired. Please sign in again.');
      }

      if (emailVerified === 'success') {
        toast.success('Email verified. You can sign in now.');
      } else if (emailVerified === 'expired') {
        toast.error('Email verification link expired. Please register again or contact admin.');
      }
    };

    loadVerifiedLogin();
  }, [dispatch, emailVerified, getProfile, loginVerified, navigate, redirect]);

   
  const submitHandler = async (e) => {
    e.preventDefault ();
    try {
      const res = await login({email, password}).unwrap();

      if (res.requiresEmailVerification) {
        setVerificationMessage(res.message);
        setVerificationUrl(res.verificationUrl || '');
        toast.success(res.message);
        return;
      }

      dispatch(setCredentials({...res, email }));  
      navigate(redirect);  
    } catch (err) {
      toast.error(err?.data.message || err.error);
    }
  };

  const googleSuccessHandler = async (credentialResponse) => {
    try {
      const res = await googleLogin({ credential: credentialResponse.credential }).unwrap();
      dispatch(setCredentials(res));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className="py-3">
    <FormContainer>
      <h1>
        Sign in
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

        <Button type='submit' variant='primary' className='my-3' disabled={isLoading}>
          Sign In
        </Button>

        { isLoading && <Loader/>}

      </Form>

      <div className='my-2'>
        <Link to='/forgot-password'>Forgot password?</Link>
      </div>

      {process.env.REACT_APP_GOOGLE_CLIENT_ID && (
        <div className='my-3'>
          <GoogleLogin
            onSuccess={googleSuccessHandler}
            onError={() => toast.error('Google login failed')}
          />
        </div>
      )}

      {(loadingGoogle || loadingProfile) && <Loader/>}

      <Row className='py-3'>
        <Col>
        New Customer? <Link to={ redirect ? `/register?redirect=${redirect}`:'register'}>Register </Link>
        </Col>
      </Row> 

    </FormContainer>
  </Container>
  )
}

export default LoginScreen
