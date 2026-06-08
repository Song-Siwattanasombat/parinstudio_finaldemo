import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { logout } from './slices/authSlice'

const App = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo?.expiresAt) {
      return undefined;
    }

    const timeLeft = userInfo.expiresAt - Date.now();

    if (timeLeft <= 0) {
      dispatch(logout());
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      dispatch(logout());
    }, timeLeft);

    return () => clearTimeout(timeoutId);
  }, [dispatch, userInfo]);

  return (
    <>
      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
      <ToastContainer />
    </>
  )
}

export default App
