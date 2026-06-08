import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Container } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader.jsx';
import { 
  useGetOrderDetailsQuery,
  useGetPaymentConfigQuery,
  useCreateStripeCheckoutSessionMutation,
  useConfirmStripePaymentMutation,
  useDeliverOrderMutation, 
 } from '../slices/ordersApiSlice.js'; 




const OrderScreen = () => {
const { id: orderId } = useParams ();
const [searchParams, setSearchParams] = useSearchParams();

const { 
  data: order, 
  refetch, 
  isLoading, 
  error 
} = useGetOrderDetailsQuery (orderId); 

const [createStripeCheckoutSession, { isLoading: loadingStripeCheckout }] =
  useCreateStripeCheckoutSessionMutation();
const [confirmStripePayment, { isLoading: loadingStripeConfirm }] =
  useConfirmStripePaymentMutation();

const [ deliverOrder, {isLoading: loadingDeliver} ] = useDeliverOrderMutation ();

const { data: paymentConfig, isLoading: loadingPaymentConfig } =
useGetPaymentConfigQuery();

const { userInfo } = useSelector((state) => state.auth); 

useEffect(() => {
  const stripeSessionId = searchParams.get('stripe_session_id');

  if (!stripeSessionId || !order || order.isPaid) {
    return;
  }

  const confirmPayment = async () => {
    try {
      await confirmStripePayment({ orderId, sessionId: stripeSessionId }).unwrap();
      setSearchParams({});
      refetch();
      toast.success('Stripe payment successful');
    } catch (err) {
      toast.error(err?.data?.message || err.message || err.error);
    }
  };

  confirmPayment();
}, [confirmStripePayment, order, orderId, refetch, searchParams, setSearchParams]);


const deliverOrderHandler = async () => {
  if (!window.confirm('Confirm that this order has been shipped/delivered?')) {
    return;
  }

  try {
    await deliverOrder(orderId);
    refetch ();
    toast.success('Order delivered and customer email sent');
  } catch (err) {
    toast.error(err?.data?.message || err.message); 
  }
}

const stripeCheckoutHandler = async () => {
  try {
    const session = await createStripeCheckoutSession(orderId).unwrap();
    window.location.href = session.url;
  } catch (err) {
    toast.error(err?.data?.message || err.message || err.error);
  }
}


  return isLoading ? (
    
    <Loader/>
   ) : error ? ( 
   <Message variant='danger'/> 
  ) : (
    <Container className="py-3">
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>

            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name:</strong> { order.user.username} 
              </p>
              <p>
                <strong>Email:</strong> { order.user.email} 
              </p>
               <p>
                <strong>Address:</strong> 
                { order.shippingAddress.address}, 
                { order.shippingAddress.city}, 
                { order.shippingAddress.postalCode}, 
                { order.shippingAddress.country}
              </p>
               {order.isDelivered ? (
                <Message variant = 'success'>
                  Delivered on {order.deliveredAt} 
                </Message>
               ) : (
                <Message variant = 'danger'>
                  Not Deliver
                </Message>
               )}
            </ListGroup.Item>
            
            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: {order.paymentMethod}</strong>
              </p>
              {order.isPaid ? (
                <Message variant = 'success'>
                  Paid on {order.paidAt} 
                </Message>
               ) : (
                <Message variant = 'danger'>
                  Not Paid
                </Message>
               )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.map((item, index) => (
                <ListGroup.Item key={index}>
                  <Row>
                    <Col md={1}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col>
                      <Link to={`/product/${item.product}`}>
                        {item.name}
                      </Link>
                    </Col>
                    <Col md={4}>
                      {item.qty} x ${item.price} =${ item.qty * item.price}
                    </Col>
                  </Row>
                </ListGroup.Item>  
              ))}
            </ListGroup.Item>
          </ListGroup>       
        </Col>

        <Col md={4}>
              <Card>
              <ListGroup>
                <ListGroup.Item>
                  <h2>Order Summary</h2>
                </ListGroup.Item>
                <ListGroup.Item>
                    <Row>
                      <Col>Items</Col>
                      <Col>${order.itemsPrice}</Col>
                    </Row>
                    <Row>
                      <Col>Shipping</Col>
                      <Col>${order.shippingPrice}</Col>
                    </Row>
                    <Row>
                      <Col>Tax</Col>
                      <Col>${order.taxPrice}</Col>
                    </Row>
                    <Row>
                      <Col>Total</Col>
                      <Col>${order.totalPrice}</Col>
                    </Row>                    
                </ListGroup.Item>     

                  {!order.isPaid && (
                    <ListGroup.Item>
                      {(loadingStripeCheckout || loadingStripeConfirm) && <Loader/>}

                      {paymentConfig?.stripeEnabled && paymentConfig?.stripeConfigured && (
                        <Button
                          type='button'
                          className='stripe-pay-button mb-3'
                          onClick={stripeCheckoutHandler}
                          disabled={loadingStripeCheckout || loadingStripeConfirm}
                        >
                          <span>Pay securely with</span>
                          <strong>stripe</strong>
                        </Button>
                      )}

                      {!loadingPaymentConfig &&
                        paymentConfig?.stripeEnabled &&
                        !paymentConfig?.stripeConfigured && (
                          <Message variant='danger'>
                            Stripe payment is not configured yet.
                          </Message>
                        )}

                    </ListGroup.Item>
                  )}
                  { loadingDeliver && <Loader/>}

                  { userInfo && userInfo.isAdmin && order.isPaid &&
                  !order.isDelivered && (
                    <ListGroup.Item>
                      <Button type='button'
                      className='btn btn-block'
                      onClick={deliverOrderHandler}>
                        Mark As Delivered
                      </Button>
                    </ListGroup.Item>
                  )}
              </ListGroup>
              </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default OrderScreen
