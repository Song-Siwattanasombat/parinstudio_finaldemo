import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js"; 
import generateToken from "../utils/generateToken.js";
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import sendEmail, { hasEmailConfig } from '../utils/sendEmail.js';

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  mobileNumber: user.mobileNumber || '',
  isAdmin: user.isAdmin,
  isEmailVerified: user.isEmailVerified,
});

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const sendVerificationEmail = async (user, token, type) => {
  const isLogin = type === 'login';
  const path = isLogin ? 'auth/verify' : 'verify-email';
  const url = `${apiUrl}/api/users/${path}/${token}`;
  const subject = isLogin ? 'Confirm your login' : 'Verify your email';
  const text = isLogin
    ? `Confirm your login by opening this link: ${url}`
    : `Verify your email by opening this link: ${url}`;

  await sendEmail({
    to: user.email,
    subject,
    text,
    html: `<p>${text}</p>`,
  });

  return url;
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${clientUrl}/reset-password/${token}`;
  const text = `Reset your password by opening this link: ${url}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your Parin Studio password',
    text,
    html: `<p>${text}</p><p>This link expires in 30 minutes.</p>`,
  });

  return url;
};


// @desc    Auth user & get token 
// @route   POST /api/users/login 
// @access  Public

const authUser = asyncHandler ( async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }); 

  if (user && (await user.matchPassword(password))) {
    if (user.isEmailVerified === false) {
      res.status(401);
      throw new Error('Please verify your email before signing in');
    }

    const loginToken = user.createLoginVerificationToken();
    await user.save();

    const verificationUrl = await sendVerificationEmail(user, loginToken, 'login');

    return res.status(200).json({
      message: 'Login confirmation sent to your email. Please open the link to continue.',
      requiresEmailVerification: true,
      verificationUrl: hasEmailConfig() ? undefined : verificationUrl,
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
   const {username, email, mobileNumber, password} = req.body;

   const userExists = await User.findOne ({ email }) ;
   
   if (userExists){
    res.status(400);
    throw new Error ('User already exists');
   }
   const user = await User.create ({
    username,
    email,
    mobileNumber: mobileNumber || '',
    password,
    isEmailVerified: false,
   });

   if (user) {
    const emailToken = user.createEmailVerificationToken();
    await user.save();

    const verificationUrl = await sendVerificationEmail(user, emailToken, 'email');

    res.status(201).json({
      message: 'Registration successful. Please verify your email before signing in.',
      verificationUrl: hasEmailConfig() ? undefined : verificationUrl,
    });
   } else {
    res.status (400);
    throw new Error ('Invalid user data');
   }



  });

// @desc    Request password reset link
// @route   POST /api/users/forgot-password
// @access  Public

const forgotPassword = asyncHandler ( async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  }

  if (user.authProvider === 'google' && !user.password) {
    return res.status(200).json({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  const resetUrl = await sendPasswordResetEmail(user, resetToken);

  res.status(200).json({
    message: 'If an account exists for that email, a password reset link has been sent.',
    resetUrl: hasEmailConfig() ? undefined : resetUrl,
  });
});

// @desc    Reset password with token
// @route   PUT /api/users/reset-password/:token
// @access  Public

const resetPassword = asyncHandler ( async (req, res) => {
  const { password } = req.body;
  const token = hashToken(req.params.token);

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Password reset link is invalid or expired');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginVerificationToken = undefined;
  user.loginVerificationExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successful. You can sign in now.' });
});

// @desc    Verify registered user email
// @route   GET /api/users/verify-email/:token
// @access  Public

const verifyEmail = asyncHandler ( async (req, res) => {
  const token = hashToken(req.params.token);

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.redirect(`${clientUrl}/login?verified=expired`);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.redirect(`${clientUrl}/login?verified=success`);
});

// @desc    Verify login by email link
// @route   GET /api/users/auth/verify/:token
// @access  Public

const verifyAdminLogin = asyncHandler ( async (req, res) => {
  const token = hashToken(req.params.token);

  const user = await User.findOne({
    loginVerificationToken: token,
    loginVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.redirect(`${clientUrl}/login?login=expired`);
  }

  user.loginVerificationToken = undefined;
  user.loginVerificationExpires = undefined;
  await user.save();

  generateToken(res, user._id);
  res.redirect(`${clientUrl}/login?login=success`);
});

// @desc    Google login
// @route   POST /api/users/google
// @access  Public

const googleAuthUser = asyncHandler ( async (req, res) => {
  const { credential } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(500);
    throw new Error('Google login is not configured');
  }

  if (!credential) {
    res.status(400);
    throw new Error('Missing Google credential');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const email = payload.email;

  if (!email || !payload.email_verified) {
    res.status(401);
    throw new Error('Google email is not verified');
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      username: payload.name || email.split('@')[0],
      email,
      mobileNumber: '',
      password: crypto.randomBytes(32).toString('hex'),
      isEmailVerified: true,
      googleId: payload.sub,
      authProvider: 'google',
    });
  } else {
    user.googleId = user.googleId || payload.sub;
    user.isEmailVerified = true;
    user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
    await user.save();
  }

  generateToken(res, user._id);
  res.status(200).json(userResponse(user));
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
      mobileNumber: user.mobileNumber || '',
      isAdmin: user.isAdmin,
      isEmailVerified: user.isEmailVerified,
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
       user.mobileNumber = req.body.mobileNumber ?? user.mobileNumber;

       if (req.body.password) {
        user.password = req.body.password;
       }

       const updateUser = await user.save ();

       res.status(200).json(userResponse(updateUser));

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
    user.mobileNumber = req.body.mobileNumber ?? user.mobileNumber;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updateUser = await user.save();

    res.status(200).json(userResponse(updateUser));
   }  else {
      res.status(404);
      throw new Error ('User not found');
   }
  });


  export {
    
    authUser,
    googleAuthUser,
    verifyEmail,
    verifyAdminLogin,
    registerUser,
    forgotPassword,
    resetPassword,
    logoutUser, 
    getUserProfile,
    updateUserProfile,
    getUsers,
    getUserByID,
    deleteUser,
    updateUser

  }

