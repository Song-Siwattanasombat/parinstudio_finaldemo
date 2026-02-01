import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";


// @desc    Fetch all products
// @route   GET /api/products
// @access  Public

const getProducts = asyncHandler ( async (req, res) => {
   const products = await Product.find({});
      res.json(products);
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
    name: 'sample',
    price:0,
    user:req.user._id,
    image:'/images/sample.jpg',
    brand:'1b',
    category:'1c',
    countInStock:0,
    numReviews:0,
    description:'4',
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


export { 
  getProducts, 
  getProductsById, 
  createdProduct, 
  updateProduct,
  deleteProduct };
