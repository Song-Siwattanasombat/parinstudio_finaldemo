import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Col } from 'react-bootstrap'
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps'
import { savePaymentMethod } from '../slices/cartSlice';
import { Container } from 'react-bootstrap';


const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState('Stripe')

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector ((state) => state.cart);
  const { shippingAddress } = cart; 

  useEffect(() => {
  if (!shippingAddress || !shippingAddress.address) {
    navigate('/shipping');
  }
}, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeOrder');
  }

  return (
  <Container className="py-3">
    <FormContainer>

      <CheckoutSteps  step1 step2 step3/>
        <div>
          <Form onSubmit= { submitHandler }>
            <Form.Group>
              <Form.Label as = 'legend'>
                Select Method
              </Form.Label>
              <Col>
                <Form.Check
                  type="radio"
                  label="Stripe - Card"
                  id="Stripe"
                  name="paymentMethod"
                  value="Stripe"
                  checked={paymentMethod === 'Stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </Col>              
            </Form.Group>

            <Button type = 'submit' variant = 'primary'>
              Continue
            </Button>          
          
          </Form>
        </div>
      
    </FormContainer> 
  </Container>  
  )
}

export default PaymentScreen
