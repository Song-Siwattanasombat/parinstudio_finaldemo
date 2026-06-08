import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, 
    unique: true,
  },

  email: {  
    type: String,
    required: true,
    unique: true,
  },

  mobileNumber: {
    type: String,
    default: '',
  },

  password: {
    type: String,
    required: true,
  },

  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },

  isEmailVerified: {
    type: Boolean,
    required: true,
    default: true,
  },

  emailVerificationToken: String,
  emailVerificationExpires: Date,
  loginVerificationToken: String,
  loginVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  googleId: String,
  authProvider: {
    type: String,
    required: true,
    default: 'local',
  },

}, {
  timestamps: true,
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return token;
};

userSchema.methods.createLoginVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');

  this.loginVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.loginVerificationExpires = Date.now() + 15 * 60 * 1000;

  return token;
};

userSchema.methods.createPasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;

  return token;
};


userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
    
});

const User = mongoose.model('User', userSchema);

export default User;
