import { Container, Row, Col } from "react-bootstrap"

const Footer = () => {
  const currentYear = new Date().getFullYear()
  return (
    <footer>
      <Container>
        <Row>
          <Col className="text-center py-3">

          {/* Instagram */}
           <a href="https://www.instagram.com/p.parin_studio" target="_blank" rel="noopener noreferrer">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
            </svg>
          </a>

          {/* Etsy */}
          <a href="https://www.etsy.com/au/shop/Parinstudioshop?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=IwY2xjawQZqARleHRuA2FlbQIxMABicmlkETFjcERHa1ZkSDRlNXc0SGhzc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHmhNu2CZyo1mK0SXb7TxKB6J5wz6Ew7hNZhKqM6dQN213fmn-o1tdVKKtjyB_aem_nN_emp9o6LwG4HPNEsW4Qw" target="_blank" rel="noopener noreferrer">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 2h18l-1.5 6H18c-.5-2-1.5-3-3.5-3H11v5h2c1.5 0 2-.5 2.3-1.8h1.2v6h-1.2C15 12.5 14.5 12 13 12h-2v6h3.8c2.5 0 3.5-1 4-3H20L21.5 22H3v-2h2V4H3z"/>
            </svg>
          </a>
          
          {/* Facebook */}
          <a href="https://www.facebook.com/profile.php?id=61587312002549" target="_blank" rel="noopener noreferrer">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8.049C16 3.603 12.418 0 8 0S0 3.603 0 8.049c0 4.017 2.926 7.347 6.75 7.951v-5.625H4.898V8.049H6.75V6.275c0-1.834 1.093-2.847 2.768-2.847.802 0 1.642.143 1.642.143v1.8H10.23c-.915 0-1.2.568-1.2 1.151v1.527h2.041l-.326 2.326H9.03V16C12.854 15.396 16 12.066 16 8.049z"/>
            </svg>
          </a>

          {/* Email */}
          <a
            href="https://mail.google.com/mail/?view=cm&to=parin.studio25@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Send me an email">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-.5 6 4 6-4V4l-6 4-6-4v-.5zm12 2.236-5.803 3.869a1 1 0 0 1-1.094 0L1 5.736V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5.736z"/>
            </svg>
          </a>

            <p>PARIN STUDIO &copy; {currentYear} </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer