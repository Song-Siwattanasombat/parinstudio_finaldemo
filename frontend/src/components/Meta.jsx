import {Helmet} from 'react-helmet-async';

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
    </Helmet>    
  )
}

Meta.defaultProps ={
  title: 'Welcome To Parinstudio',
  description: 'We sell notebooks with high quality and low price',
  keywords: 'notes, notebooks, stationary'
}

export default Meta