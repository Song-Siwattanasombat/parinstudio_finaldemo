import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js"; 
import generateToken from "../utils/generateToken.js";


// @desc    Auth user & get token 
// @route   POST /api/users/login 
// @access  Public

const authUser = asyncHandler ( async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }); 

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }   
  });

// @desc    Register a new user
// @route   POST /api/users
// @access  Public

const registerUser = asyncHandler ( async (req, res) => {
   const {username, email, password} = req.body;

   const userExists = await User.findOne ({ email }) ;
   
   if (userExists){
    res.status(400);
    throw new Error ('User already exists');
   }
   const user = await User.create ({
    username,
    email,
    password
   });

   if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id:user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
   } else {
    res.status (400);
    throw new Error ('Invalid user data');
   }



  });

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private 

const logoutUser = asyncHandler ( async (req, res) => {
   res.cookie( 'jwt' , '', {
    httpOnly:true,
    expires: new Date(0)
   });

   res.status(200).json ({message: 'Logged out successfully'});
  });

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private

const getUserProfile = asyncHandler ( async (req, res) => {
   const user = await User.findById (req.user._id);

    if(user) {
       res.status(200).json({
      _id:user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error ('User not found');
  }

  });

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private

const updateUserProfile = asyncHandler ( async (req, res) => {
   const user = await User.findById (req.user._id);

    if(user) {
      
       user.username = req.body.username || user.username;
       user.email = req.body.email || user.email;

       if (req.body.password) {
        user.password = req.body.password;
       }

       const updateUser = await user.save ();

       res.status(200).json({
        _id:updateUser._id,
        username: updateUser.username,
        email: updateUser.email,
        isAdmin: updateUser.isAdmin,
       });

  } else {
    res.status(404);
    throw new Error ('User not found');
  }
  });

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin

const getUsers = asyncHandler ( async (req, res) => {
   const users = await User.find({});
   res.status(200).json(users);
  });

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin

const getUserByID = asyncHandler ( async (req, res) => {
   const user = await User.findById(req.params.id).select('-password');
  
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
  
  });

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin

const deleteUser = asyncHandler ( async (req, res) => {
   const user = await User.findById(req.params.id);

   if (user) {
    if (user.isAdmin) {
      res.status (400);
      throw new Error ('cannot delete admin user');
    }
    await User.deleteOne ({_id: user._id})
    res.status(200).json ({message: 'User deleted successfully'});
   } else {
    res.status (404);
    throw new Error ('User not found');
   }
  });

// @desc    Update user by admin
// @route   PUT /api/users/:id
// @access  Private/Admin

const updateUser = asyncHandler ( async (req, res) => {
   const user = await User.findById (req.params.id);

   if (user) {
    user.username=req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updateUser = await user.save();

    res.status(200).json ({
      _id: updateUser._id,
      username: updateUser.username,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
    });
   }  else {
      res.status(404);
      throw new Error ('User not found');
   }
  });


  export {
    
    authUser,
    registerUser,
    logoutUser, 
    getUserProfile,
    updateUserProfile,
    getUsers,
    getUserByID,
    deleteUser,
    updateUser

  }

