import { Link } from 'react-router-dom';
import { useGetSiteSettingsQuery } from '../slices/siteSettingsApiSlice';

const defaultSettings = {
  heroTitle: 'Start where you feel calm.\nWrite where you grow.',
  heroText: 'Parin creates notebooks inspired by gardens, sunlight, and quiet moments.\nEach page is a gentle space for you to slow down, listen inward, and begin again.',
  heroImage: '/images/hero-section.jpg',
  aboutTitle: 'Your Personal Garden',
  aboutText: 'More than stationery, PARIN is a quiet companion\nfor journaling, reflection, and mindful living.',
  featureTitle: 'Why choose PARIN',
  featureText: 'Parin was born from a love of gardens\nand the art of writing. We believe in creating\na quiet space where you can pause, reflect, and grow.',
  featureImage: '/images/hero-section.jpg',
  reviewTitle: 'From garden to notebook',
  reviewText: '"Parin was born from a love of gardens\nand the art of writing. We believe in creating\na quiet space where you can pause, reflect, and grow"',
  reviewImage: '/images/hero-section.jpg',
  contactEmail: 'parin.studio25@gmail.com',
};

const renderLines = (text) =>
  text.split('\n').map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </span>
  ));

const renderHeroTitle = (title) => {
  if (title === defaultSettings.heroTitle) {
    return (
      <>
        Start where you feel calm.<br />
        Write where you <em>grow.</em>
      </>
    );
  }

  return renderLines(title);
};


const Home = () => {
  const { data: siteSettings } = useGetSiteSettingsQuery();
  const settings = { ...defaultSettings, ...siteSettings };

  return (
    <div className='home-container'>

      {/* Hero Section */}
      <section
        className="home-hero text-left"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(243, 238, 234, 0.7), rgba(243, 238, 234, 0)), url('${settings.heroImage}')`,
        }}
      >
        <h1 className="mb-4">
          {renderHeroTitle(settings.heroTitle)}
        </h1>
        <p className="mb-5">
          {renderLines(settings.heroText)}
        </p>
        <div className="hero-buttons mb-6 d-flex justify-content-left gap-3">
          <Link to="/product" className="btn btn-primary">Shop the Collection</Link>
          <Link to={`https://mail.google.com/mail/?view=cm&to=${settings.contactEmail}`} className="btn btn-secondary">Contact Us</Link>
        </div>
      </section>

      {/* About Section */}
      <section className="home-about text-center my-2">
        <h2>{settings.aboutTitle}</h2>
        <p>
          {renderLines(settings.aboutText)}
        </p>
      </section>

      <section className="home-features d-flex flex-wrap gap-2 my-2">
      {/* Image Column */}
      <div className="home-feature home-feature-image">
        <img src={settings.featureImage} alt="Personal Garden" />
      </div>

      {/* Text Column */}
      <div className="home-feature home-feature-text d-flex flex-column gap-2">
        <svg className= 'icon-feature' xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1.4 1.7c.216.289.65.84 1.725 1.274 1.093.44 2.884.774 5.834.528l.37-.023c1.823-.06 3.117.598 3.956 1.579C14.16 6.082 14.5 7.41 14.5 8.5c0 .58-.032 1.285-.229 1.997q.198.248.382.54c.756 1.2 1.19 2.563 1.348 3.966a1 1 0 0 1-1.98.198c-.13-.97-.397-1.913-.868-2.77C12.173 13.386 10.565 14 8 14c-1.854 0-3.32-.544-4.45-1.435-1.125-.887-1.89-2.095-2.391-3.383C.16 6.62.16 3.646.509 1.902L.73.806zm-.05 1.39c-.146 1.609-.008 3.809.74 5.728.457 1.17 1.13 2.213 2.079 2.961.942.744 2.185 1.22 3.83 1.221 2.588 0 3.91-.66 4.609-1.445-1.789-2.46-4.121-1.213-6.342-2.68-.74-.488-1.735-1.323-1.844-2.308-.023-.214.237-.274.38-.112 1.4 1.6 3.573 1.757 5.59 2.045 1.227.215 2.21.526 3.033 1.158.058-.39.075-.782.075-1.158 0-.91-.288-1.988-.975-2.792-.626-.732-1.622-1.281-3.167-1.229l-.316.02c-3.05.253-5.01-.08-6.291-.598a5.3 5.3 0 0 1-1.4-.811"/>
        </svg>          
        <h2>{settings.featureTitle}</h2>
        <p>
          {renderLines(settings.featureText)}
        </p>
        <Link to="/product" className="btn btn-secondary">Shop Now</Link>
      </div>
    </section>


      {/* Services Section */}
      <section className="home-services-container text-center my-5">
        <h2>Our Services</h2>
        <div className="home-services">

          {/* Service 1 */}
          <div className="home-service d-flex flex-column align-items-center text-center gap-3 p-3">
            <svg className= 'icon-feature' xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
            </svg>
            <h3>Thick, no-bleed paper</h3>
            <p>Premium 100gsm paper that's a joy to write on</p>
          </div>

          {/* Service 2 */}
          <div className="home-service d-flex flex-column align-items-center text-center gap-3 p-3">
            <svg className= 'icon-feature' xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.174 1.184a2 2 0 0 1 3.652 0A2 2 0 0 1 12.99 3.01a2 2 0 0 1 1.826 3.164 2 2 0 0 1 0 3.652 2 2 0 0 1-1.826 3.164 2 2 0 0 1-3.164 1.826 2 2 0 0 1-3.652 0A2 2 0 0 1 3.01 12.99a2 2 0 0 1-1.826-3.164 2 2 0 0 1 0-3.652A2 2 0 0 1 3.01 3.01a2 2 0 0 1 3.164-1.826M8 1a1 1 0 0 0-.998 1.03l.01.091q.017.116.054.296c.049.241.122.542.213.887.182.688.428 1.513.676 2.314L8 5.762l.045-.144c.248-.8.494-1.626.676-2.314.091-.345.164-.646.213-.887a5 5 0 0 0 .064-.386L9 2a1 1 0 0 0-1-1M2 9l.03-.002.091-.01a5 5 0 0 0 .296-.054c.241-.049.542-.122.887-.213a61 61 0 0 0 2.314-.676L5.762 8l-.144-.045a61 61 0 0 0-2.314-.676 17 17 0 0 0-.887-.213 5 5 0 0 0-.386-.064L2 7a1 1 0 1 0 0 2m7 5-.002-.03a5 5 0 0 0-.064-.386 16 16 0 0 0-.213-.888 61 61 0 0 0-.676-2.314L8 10.238l-.045.144c-.248.8-.494 1.626-.676 2.314-.091.345-.164.646-.213.887a5 5 0 0 0-.064.386L7 14a1 1 0 1 0 2 0m-5.696-2.134.025-.017a5 5 0 0 0 .303-.248c.184-.164.408-.377.661-.629A61 61 0 0 0 5.96 9.23l.103-.111-.147.033a61 61 0 0 0-2.343.572c-.344.093-.64.18-.874.258a5 5 0 0 0-.367.138l-.027.014a1 1 0 1 0 1 1.732zM4.5 14.062a1 1 0 0 0 1.366-.366l.014-.027q.014-.03.036-.084a5 5 0 0 0 .102-.283c.078-.233.165-.53.258-.874a61 61 0 0 0 .572-2.343l.033-.147-.11.102a61 61 0 0 0-1.743 1.667 17 17 0 0 0-.629.66 5 5 0 0 0-.248.304l-.017.025a1 1 0 0 0 .366 1.366m9.196-8.196a1 1 0 0 0-1-1.732l-.025.017a5 5 0 0 0-.303.248 17 17 0 0 0-.661.629A61 61 0 0 0 10.04 6.77l-.102.111.147-.033a61 61 0 0 0 2.342-.572c.345-.093.642-.18.875-.258a5 5 0 0 0 .367-.138zM11.5 1.938a1 1 0 0 0-1.366.366l-.014.027q-.014.03-.036.084a5 5 0 0 0-.102.283c-.078.233-.165.53-.258.875a61 61 0 0 0-.572 2.342l-.033.147.11-.102a61 61 0 0 0 1.743-1.667c.252-.253.465-.477.629-.66a5 5 0 0 0 .248-.304l.017-.025a1 1 0 0 0-.366-1.366M14 9a1 1 0 0 0 0-2l-.03.002a5 5 0 0 0-.386.064c-.242.049-.543.122-.888.213-.688.182-1.513.428-2.314.676L10.238 8l.144.045c.8.248 1.626.494 2.314.676.345.091.646.164.887.213a5 5 0 0 0 .386.064zM1.938 4.5a1 1 0 0 0 .393 1.38l.084.035q.108.045.283.103c.233.078.53.165.874.258a61 61 0 0 0 2.343.572l.147.033-.103-.111a61 61 0 0 0-1.666-1.742 17 17 0 0 0-.66-.629 5 5 0 0 0-.304-.248l-.025-.017a1 1 0 0 0-1.366.366m2.196-1.196.017.025a5 5 0 0 0 .248.303c.164.184.377.408.629.661A61 61 0 0 0 6.77 5.96l.111.102-.033-.147a61 61 0 0 0-.572-2.342c-.093-.345-.18-.642-.258-.875a5 5 0 0 0-.138-.367l-.014-.027a1 1 0 1 0-1.732 1m9.928 8.196a1 1 0 0 0-.366-1.366l-.027-.014a5 5 0 0 0-.367-.138c-.233-.078-.53-.165-.875-.258a61 61 0 0 0-2.342-.572l-.147-.033.102.111a61 61 0 0 0 1.667 1.742c.253.252.477.465.66.629a5 5 0 0 0 .304.248l.025.017a1 1 0 0 0 1.366-.366m-3.928 2.196a1 1 0 0 0 1.732-1l-.017-.025a5 5 0 0 0-.248-.303 17 17 0 0 0-.629-.661A61 61 0 0 0 9.23 10.04l-.111-.102.033.147a61 61 0 0 0 .572 2.342c.093.345.18.642.258.875a5 5 0 0 0 .138.367zM8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
            </svg>
            <h3>Inspired by nature</h3>
            <p>Minimal, timeless design inspired by gardens and calm living</p>
          </div>

          {/* Service 3 */}
          <div className="home-service d-flex flex-column align-items-center text-center gap-3 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-truck" viewBox="0 0 16 16">
              <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
            </svg>
            <h3>Free shipping</h3>
            <p>Fast, free delivery on all orders over $50</p>
          </div>

        </div>
      </section>

      {/* Review Section */}
      <section className="review-features d-flex flex-wrap gap-2 my-2">
      
      {/* Text Column */}
      <div className="review-feature review-feature-text d-flex flex-column gap-2">
           
        <h2><i>{settings.reviewTitle}</i></h2>
        <p>
          {renderLines(settings.reviewText)}
        </p>        
      </div>

      {/* Image Column */}
      <div className="review-feature review-feature-image">
        <img src={settings.reviewImage} alt="Personal Garden" />
      </div>

    </section>


    </div>
  );
};

export default Home;
