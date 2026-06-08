import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import PrivateRoute  from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx'; 
import Home from './screens/Home.jsx';
import Homescreen from './screens/Homescreen.jsx';
import ProductScreen from './screens/ProductScreen.jsx';
import CartScreen from './screens/CartScreen.jsx';
import { Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import {HelmetProvider} from 'react-helmet-async';
import store from './store';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen.jsx';
import ResetPasswordScreen from './screens/ResetPasswordScreen.jsx';
import ShippingScreen from './screens/ShippingScreen.jsx';
import PaymentScreen from './screens/PaymentScreen.jsx';
import PlaceOrderScreen from './screens/PlaceOrderScreen.jsx';
import OrderScreen from './screens/OrderScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import OrderListScreen from './screens/admin/OrderListScreen.jsx';
import ProductListScreen from './screens/admin/ProductListScreen.jsx';
import ProductEditScreen from './screens/admin/ProductEditScreen.jsx';
import UserListScreen from './screens/admin/UserListScreen.jsx';  
import UserEditScreen from './screens/admin/UserEditScreen.jsx';
import SiteSettingsScreen from './screens/admin/SiteSettingsScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App/>}>
      <Route index={true} path="/" element={<Home/>}></Route>
      <Route path="/product" element={<Homescreen/>}></Route>
      <Route path="/product/search/:keyword" element={<Homescreen/>}></Route>
      <Route path="/product/page/:pageNumber" element={<Homescreen/>}></Route>
      <Route path="/product/search/:keyword/page/:pageNumber" element={<Homescreen/>}></Route>
      <Route path="/product/:id" element={<ProductScreen/>}></Route>
      <Route path="/cart" element={<CartScreen/>}></Route>
      <Route path="/login" element={<LoginScreen/>}></Route>
      <Route path="/register" element={<RegisterScreen/>}></Route>
      <Route path="/forgot-password" element={<ForgotPasswordScreen/>}></Route>
      <Route path="/reset-password/:token" element={<ResetPasswordScreen/>}></Route>

      <Route path="" element={<PrivateRoute/>}>
        <Route path="/shipping" element={<ShippingScreen/>} />  
        <Route path="/payment" element={<PaymentScreen/>} />
        <Route path="/placeorder" element={<PlaceOrderScreen/>} />
        <Route path="/order/:id" element={<OrderScreen/>} />
        <Route path="/profile" element={<ProfileScreen/>} />
      </Route>

      <Route path="" element={<AdminRoute/>}>
        <Route path="/admin/orderlist" element={<OrderListScreen/>} />  
        <Route path="/admin/productlist" element={<ProductListScreen/>} />
        <Route path="/admin/productlist/page/:pageNumber" element={<ProductListScreen/>} />
        <Route path="/admin/product/:id/edit" element={<ProductEditScreen/>} />       
        <Route path="/admin/userlist" element={<UserListScreen/>} /> 
        <Route path="/admin/user/:id/edit" element={<UserEditScreen/>} />
        <Route path="/admin/settings" element={<SiteSettingsScreen/>} />
      </Route>
      
    </Route>
  )

)


const app = (
  <HelmetProvider>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </HelmetProvider>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {process.env.REACT_APP_GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        {app}
      </GoogleOAuthProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);


reportWebVitals();
