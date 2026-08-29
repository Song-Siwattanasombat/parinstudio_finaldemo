
import { useNavigate } from 'react-router-dom';
import { Badge, Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUser} from 'react-icons/fa';
import {LinkContainer} from 'react-router-bootstrap';
import {useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import SearchBox from './SearchBox';
import { useGetSiteSettingsQuery } from '../slices/siteSettingsApiSlice';

import logo from '../assets/logo.png';


const Header = () => {
  const  { cartItems } = useSelector((state) => state.cart);
  const  { userInfo } = useSelector((state) => state.auth);
  const { data: siteSettings } = useGetSiteSettingsQuery();

  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  const [logoutApiCall] = useLogoutMutation ();

  const logoutHandler = async () => { 
  try {
    await logoutApiCall().unwrap();
    dispatch (logout());
    navigate ('/login')
  } catch (err) {
    console.log(err); 
  }
  };
  
  return (
    <header>
      <Navbar expand="md" collapseOnSelect className="parin-navbar">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="parin-brand">
              <img
                src={logo}
                alt={siteSettings?.brandName || 'Parin Studio'}
                style={{ width: '52px', height: '52px', objectFit: 'contain' }}
              />
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <SearchBox />
              <LinkContainer to="/cart">
                <Nav.Link>
                  <FaShoppingCart/>
                    
                    {cartItems.length > 0 && (
                      <Badge pill bg="success" style={{marginLeft: '5px'}}>
                        {cartItems.reduce((a, c) => a + c.qty, 0)}
                      </Badge>
                    )}
                </Nav.Link>
              </LinkContainer>

              { userInfo? (
                <NavDropdown title={userInfo.username} id='username'>
                  <LinkContainer to ='/profile'>
                    <NavDropdown.Item>
                      Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ): (
              <LinkContainer to="/Login">
                <Nav.Link href ='/Login'>
                  <FaUser/>
                    Login
                </Nav.Link>
              </LinkContainer> )}
              
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title='Admin' id='adminmenu'>
                  <LinkContainer to = '/admin/productlist'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to = '/admin/userlist'>
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to = '/admin/orderlist'>
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to = '/admin/settings'>
                    <NavDropdown.Item>Settings</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
} 

export default Header;
