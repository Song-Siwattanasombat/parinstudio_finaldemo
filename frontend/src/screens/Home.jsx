import {Link} from 'react-router-dom';


const Home = () => {
  return (
    
    <div className='home-container'>

       {/* Hero Section */}
      <div className="home-hero">        
        <h1 className="mb-4">Start where you feel calm.<br/> Write where you <em>grow.</em></h1>
        <p className="mb-5">Parin creates notebooks inspired by gardens, <br/> sunlight, and quiet moments Each page is <br/> a gentle space for you to slow down, <br/> listen inward, and begin again</p>
        <div className="mb-6">
          <Link to="/product" className="btn btn-primary">Shop the Collection</Link>
          <Link to="/" className="btn btn-secondary">Contact Us</Link>
        </div>
      </div>

       {/* About Section */}
      <div className="home-about">
        <h2>Your Personal Garden</h2>
        <p>More than stationery, PARIN is a quiet companion <br/> for journaling, reflection, and mindful living.</p>
      </div>
        
      <div className="home-about-2">
        <img src= "/images/hero-section.jpg" alt="Personal Garden" />
        <h2>why choose PARIN</h2>
        <p>parin was born from a love of gardens and the art of writing. We believe in creating a quiet space where you can pause, reflect, and grow</p>
        <Link to="/product" className="btn btn-secondary">Shop Now</Link>        
      </div>

      {/* Services Section */}
      <div className='home-services'> 
        <h2>Our Services</h2> 
        <p>1</p>
        <p>2</p>
        <p>3</p>               
      </div>

      {/* Inspire Section */}
      <div className='home-inspire'> 
        <h2>From garden to notebook</h2>   
        <p>reviews</p>    
        <img src="" alt="Personal Garden" /> 
      </div>

    </div>
  );
};

export default Home;