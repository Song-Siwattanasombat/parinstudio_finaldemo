import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";


// @desc    Fetch all products
// @route   GET /api/products
// @access  Public

const getProducts = asyncHandler ( async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 8;
  const page = Math.max(Number(req.query.pageNumber) || 1, 1);

  const keyword = req.query.keyword ?
  { name: {$regex: req.query.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i'} } : {};

  const [count, products] = await Promise.all([
    Product.countDocuments({...keyword}),
    Product.find({...keyword})
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .lean()
  ]);
      res.json({products, page, pages:Math.ceil(count / pageSize)});
  });


// @desc    Fetch 1 product
// @route   GET /api/products/:id
// @access  Public

const getProductsById = asyncHandler ( async (req, res) => {
   const product = await Product.findById(req.params.id);

    if (product) {
      return res.json(product);
    }else
    {
      res.status(404);
      throw new Error('Resource not found');
    }
  });

// @desc    Create a  products
// @route   POST /api/products
// @access  Private/Admin

  const createdProduct = asyncHandler ( async (req, res) => {
   const product = new Product ({
    name: 'New Notebook',
    price:0,
    user:req.user._id,
    image:'/images/logo.png',
    brand:'Parin Studio',
    category:'Notebook',
    countInStock:0,
    numReviews:0,
    description:'Update this product before publishing.',
   })
  
   const createdProduct = await product.save();
   res.status(201).json(createdProduct); 

  });

// @desc    update product
// @route   PUT /api/products/:id
// @access  Private/Admin

const updateProduct = asyncHandler ( async (req, res) => {
   /* console.log("Received data to update:", req.body); */
    const { name, price, description, image, 
      brand, category, countInStock } = req.body;  

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name;
      product.price = price;
      product.description = description;
      product.image = image;
      product.brand = brand;
      product.category = category;
      product.countInStock = countInStock;
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);

    } else {
      res.status(404);
      throw new Error ('Resource not found');
    }

  });

// @desc    delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin

const deleteProduct = asyncHandler ( async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({_id: product._id});
      res.status(200).json ({message: 'Product deleted'});

    } else {
      res.status(404);
      throw new Error ('Resource not found');
    }

  });


// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private

const createdProductReview = asyncHandler ( async (req, res) => {

    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (review) => review.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
      }

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating = 
        product.reviews.reduce ((acc, review) => acc+review.rating,0)/
        product.reviews.length;

      await product.save();
      res.status(201).json ({message: 'Review added'});  

    } else {
      res.status(404);
      throw new Error ('Resource not found');
    }

  });


export { 

  getProducts, 
  getProductsById, 
  createdProduct, 
  updateProduct,
  deleteProduct,
  createdProductReview,

};
