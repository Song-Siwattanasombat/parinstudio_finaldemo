import { Row, Col } from 'react-bootstrap';
import {useParams} from 'react-router-dom';
import { Link } from 'react-router-dom';
import Products from '../components/Products';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { Container } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate.jsx';
import Meta from '../components/Meta.jsx';

const Homescreen = () => {

  const { pageNumber,keyword } = useParams();
  const page = Number(pageNumber) || 1;

  const { data, isLoading, error } = useGetProductsQuery({ 
    keyword,
    pageNumber: page });

  return (
  <Container className="py-3"> 
    { keyword && <Link to = '/product' className='btn btn-light mb-4'>Go Back</Link> }
    {isLoading ? (
      <Loader/>
    ) : error ? (
      <Message variant='danger'>{error?.data?.message || error.error}</Message>
    ) : (
      <>
        <Meta/>
        <h1>Our Products</h1>
        <Row >
          {data.products.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
              <Products product={product} />
            </Col>
          ))}
        </Row>
        <Paginate
          pages={data.pages}
          page={data.page}
          keyword={keyword} 
        />
      </>
    )}
  </Container>
  );
};

export default Homescreen