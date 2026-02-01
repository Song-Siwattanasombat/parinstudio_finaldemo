import {Link} from 'react-router-dom';


const Home = () => {
  return (
    
    <div>
      <div className="">
        <h1>Parin Studio</h1>
        <h2>Start where you feel calm. Write where you grow.</h2>
        <p>Parin creates notebooks inspired by gardens, sunlight, and quiet moments Each page is a gentle space for you to slow down, listen inward, and begin again</p>
        <Link to="/product" className="btn btn-primary">Shop the Collection</Link>
        <Link to="/" className="btn btn-primary">Explore More</Link>
      </div>
      <div className="">
        <h2>Your Personal garden</h2>
        <p>More than stationery, PARIN is a quiet companion for journaling, reflection, and mindful living.</p>
        <img src="" alt="Personal Garden" />
        <h2>why choose PARIN</h2>
        <p>parin was born from a love of gardens and the art of writing. We believe in creating a quiet space where you can pause, reflect, and grow</p>
        <Link to="/product" className="btn btn-primary">Shop Now</Link>        
      </div>
      <div> 
        <h2>Our Services</h2> 
        <p>1</p>
        <p>2</p>
        <p>3</p>               
      </div>
      <div> 
        <h2>From garden to notebook</h2>   
        <p>reviews</p>    
        <img src="" alt="Personal Garden" /> 
      </div>

    </div>
  );
};

export default Home;