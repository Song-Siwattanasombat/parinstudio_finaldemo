import { LinkContainer } from 'react-router-bootstrap';
import {Table,Button } from 'react-bootstrap';
import { FaTimes, FaTrash } from 'react-icons/fa';
import  Message  from '../../components/Message';
import  Loader  from '../../components/Loader';
import { toast } from 'react-toastify';
import { useDeleteOrderMutation, useGetOrdersQuery } from '../../slices/ordersApiSlice';
import { Container } from 'react-bootstrap';

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  const [deleteOrder, { isLoading: loadingDelete }] = useDeleteOrderMutation();

  const deleteHandler = async(id) => {
    if (window.confirm('Are you sure to delete this order?')) {
      try {
        await deleteOrder(id).unwrap();
        toast.success('Order deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <Container className="py-3">
      <h1>Orders</h1>
      { loadingDelete && <Loader/>}
      { isLoading ? (
        <Loader/>
      ) : error? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm'>
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
            </tr>
          </thead> 
          <tbody>
            { orders.map ((order) => 
              <tr key={order._id}>
                <td> {order._id}</td>
                <td> {order.user && order.user.username }</td>
                <td> {order.createdAt.substring(0,10)}</td>
                <td> ${order.totalPrice}</td>
                <td>
                  { order.isPaid ? (
                    order.paidAt.substring(0,10)
                  ) : (
                    <FaTimes style= {{ color:'red'}}/>
                  )}
                </td>
                <td>
                  { order.isDelivered ? (
                    order.deliveredAt.substring(0,10)
                  ) : (
                    <FaTimes style= {{ color:'red'}}/>
                  )}
                </td>
                <td>
                  <LinkContainer to= {`/order/${order._id}`}>
                    <Button variant = 'light' className='btn-sm'>Details</Button>
                  </LinkContainer>  
                  <Button
                    variant='danger'
                    className='btn-sm'
                    onClick={() => deleteHandler(order._id)}
                  >
                    <FaTrash style={{color: 'white'}} />
                  </Button>
                </td>
              </tr>)}
          </tbody> 
        </Table>
      )}
    </Container>
  )
}

export default OrderListScreen
