import {
  signupWithOtp,
  verifyOtpAndSignup,
  sendForgotOtp,
  verifyForgototp,
  resetPasswordService,
  loginService,
} from '../services/userauth.service.js';

import { getUserById } from '../services/user.service.js';
import User from '../models/user.js';
import Address from '../models/address.model.js';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateOtp,
  validateAddress,
  validateObjectId,
  sanitizeInput
} from '../utils/validators.js';

// ================= auth ================= //

export const Login = (req, res) => {
  res.render('users/login' , {message: ' '});
};

export const PostLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('users/login', {
        message: 'Email and password are required',
      });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.render('users/login', {
        message: emailValidation.message,
      });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();
    const user = await loginService(sanitizedEmail, password);
    req.session.userId = user._id;

    res.redirect('/home');
  } catch (error) {
    res.render('users/login', { message: error.message });
  }
};

export const Signup = (req, res) => {
  res.render('users/signup');
};

export const PostSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.render('users/signup', { error: nameValidation.message });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.render('users/signup', { error: emailValidation.message });
    }

    // Validate phone
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return res.render('users/signup', { error: phoneValidation.message });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.render('users/signup', { error: passwordValidation.message });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email).toLowerCase().trim(),
      phone: sanitizeInput(phone),
      password: password
    };

    await signupWithOtp(sanitizedData, req.session);
    res.redirect('/verify-otp');
  } catch (err) {
    res.render('users/signup', { error: err.message });
  }
};

// ================= OTP page ================= //

export const VerifyOtpPage = (req, res) => {
  if (
    !req.session.tempUser &&
    !req.session.resetPassword &&
    !req.session.emailReset
  ) {
    return res.redirect('/login');
  }

  const email =
    req.session.tempUser?.email ||
    req.session.resetPassword?.email ||
    req.session.emailReset?.email ||
    req.session.emailReset?.newEmail;

  // Calculate remaining time
  let remainingTime = 0;
  if (req.session.tempUser?.otpExpiry) {
    remainingTime = Math.max(0, Math.floor((req.session.tempUser.otpExpiry - Date.now()) / 1000));
  } else if (req.session.resetPassword?.expiresAt) {
    remainingTime = Math.max(0, Math.floor((req.session.resetPassword.expiresAt - Date.now()) / 1000));
  } else if (req.session.emailReset?.otpExpiry) {
    remainingTime = Math.max(0, Math.floor((req.session.emailReset.otpExpiry - Date.now()) / 1000));
  }

  res.render('users/verifyOtp', { 
    email,
    remainingTime 
  });
};

// ================= RESEND OTP ================= //

export const resendOtp = async (req, res) => {
  try {
    if (
      !req.session.tempUser &&
      !req.session.resetPassword &&
      !req.session.emailReset
    ) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP session found'
      });
    }

    let email;
    if (req.session.tempUser) {
      // Resend OTP for signup
      const tempUserData = {
        name: req.session.tempUser.full_name,
        email: req.session.tempUser.email,
        phone: req.session.tempUser.phone,
        password: req.session.tempUser.password
      };
      email = req.session.tempUser.email;
      await signupWithOtp(tempUserData, req.session);
    } else if (req.session.resetPassword) {
      // Resend OTP for password reset
      email = req.session.resetPassword.email;
      await sendForgotOtp(email, req.session);
    } else if (req.session.emailReset) {
      // Resend OTP for email reset
      email = req.session.emailReset.email || req.session.emailReset.newEmail;
      await sendForgotOtp(email, req.session);
    }

    // Calculate remaining time after resend
    let remainingTime = 0;
    if (req.session.tempUser?.otpExpiry) {
      remainingTime = Math.max(0, Math.floor((req.session.tempUser.otpExpiry - Date.now()) / 1000));
    } else if (req.session.resetPassword?.expiresAt) {
      remainingTime = Math.max(0, Math.floor((req.session.resetPassword.expiresAt - Date.now()) / 1000));
    } else if (req.session.emailReset?.otpExpiry) {
      remainingTime = Math.max(0, Math.floor((req.session.emailReset.otpExpiry - Date.now()) / 1000));
    }

    return res.json({
      success: true,
      message: 'OTP resent successfully',
      remainingTime
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// ================= OTP VERIFY ================= //

export const PostVerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    // Validate OTP format
    const otpValidation = validateOtp(otp);
    if (!otpValidation.valid) {
      const email =
        req.session.tempUser?.email ||
        req.session.resetPassword?.email ||
        req.session.emailReset?.email ||
        req.session.emailReset?.newEmail ||
        "";
      return res.render("users/verifyOtp", {
        error: otpValidation.message,
        email,
      });
    }

    if (req.session.tempUser) {
      await verifyOtpAndSignup(otp, req.session);
      req.session.tempUser = null;
      return res.redirect("/login");
    }

    if (req.session.emailReset) {

      await verifyForgototp(otp, req.session);


      if (req.session.emailReset.step === "verify-old") {
        req.session.emailReset.step = "enter-new";
        delete req.session.resetPassword;

        return res.redirect("/email-reset");
      }

      if (req.session.emailReset.step === "verify-new") {
        await User.findByIdAndUpdate(
          req.session.userId,
          { email: req.session.emailReset.newEmail },
          { runValidators: false }
        );

        req.session.emailReset = null;
        delete req.session.resetPassword;

        return res.redirect("/login");
      }
    }

    if (req.session.resetPassword) {

      await verifyForgototp(otp, req.session);

      return res.redirect("/reset-password");
    }

    throw new Error("Invalid or expired OTP session");

  } catch (error) {

    const email =
      req.session.tempUser?.email ||
      req.session.resetPassword?.email ||
      req.session.emailReset?.email ||
      req.session.emailReset?.newEmail ||
      "";

    return res.render("users/verifyOtp", {
      error: error.message,
      email,
    });
  }
};



// ================= FORGOT PASSWORD ================= //

export const ForgotPassword = (req, res) => {
  res.render('users/forgotPassword');
};

export const PostForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.render('users/forgotPassword', { error: emailValidation.message });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();
    await sendForgotOtp(sanitizedEmail, req.session);
    res.redirect('/verify-otp');
  } catch (err) {
    res.render('users/forgotPassword', { error: err.message });
  }
};

export const ResetPasswordPage = (req, res) => {
  if (!req.session.resetPassword) {
    return res.redirect('/forgot-password');
  }


  res.render('users/resetPassword');
};

export const PostResetPassword = async (req, res) => {
  try {
    const email = req.session.resetPassword?.email;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.render('users/resetPassword', { error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.render('users/resetPassword', { error: 'Passwords do not match' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.render('users/resetPassword', { error: passwordValidation.message });
    }

    await resetPasswordService(email, password);
    req.session.resetPassword = null;
    res.redirect('/login');
  } catch (err) {
    res.render('users/resetPassword', { error: err.message });
  }
};

// ================= EMAIL RESET ================= //

export const startEmailReset = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }

    req.session.emailReset = {
      step: 'verify-old',
      email: user.email,
    };

    delete req.session.resetPassword;

    await sendForgotOtp(user.email, req.session);
    res.redirect('/verify-otp');
  } catch (err) {
    console.error('Error starting email reset:', err);
    res.redirect('/profile');
  }
};




export const emailResetPage = (req, res) => {
  if (
    !req.session.emailReset ||
    req.session.emailReset.step !== 'enter-new'
  ) {
    return res.redirect('/profile');
  }

  res.render('users/emailReset', {
    emailReset: req.session.emailReset
  });
};



export const postEmailReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.render('users/emailReset', {
        error: emailValidation.message,
        emailReset: req.session.emailReset
      });
    }

    // Check if new email is same as old email
    if (email.toLowerCase().trim() === req.session.emailReset.email.toLowerCase().trim()) {
      return res.render('users/emailReset', {
        error: 'New email must be different from current email',
        emailReset: req.session.emailReset
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.render('users/emailReset', {
        error: 'This email is already registered',
        emailReset: req.session.emailReset
      });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();
    req.session.emailReset.newEmail = sanitizedEmail;
    req.session.emailReset.step = 'verify-new';

    await sendForgotOtp(sanitizedEmail, req.session);
    return res.redirect('/verify-otp');
  } catch (err) {
    res.render('users/emailReset', {
      error: err.message,
      emailReset: req.session.emailReset
    });
  }
};


// ================= PROFILE ================= //

export const ProfileRedirect = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const user = await User.findById(req.session.userId);
  res.render('users/ProfilePage', { user });
};

export const getEditProfile = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const user = await getUserById(req.session.userId);
  res.render('users/editProfile', { user });
};


export const updateProfile = async (req, res) => {
  try {
    // Handle multer errors
    if (req.fileValidationError) {
      const user = await getUserById(req.session.userId);
      return res.render('users/editProfile', {
        user,
        error: req.fileValidationError
      });
    }

    const { name, mobile } = req.body;

    if (!name || !mobile) {
      const user = await getUserById(req.session.userId);
      return res.render('users/editProfile', {
        user,
        error: 'Name and mobile number are required'
      });
    }

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      const user = await getUserById(req.session.userId);
      return res.render('users/editProfile', {
        user,
        error: nameValidation.message
      });
    }

    // Validate phone
    const phoneValidation = validatePhone(mobile);
    if (!phoneValidation.valid) {
      const user = await getUserById(req.session.userId);
      return res.render('users/editProfile', {
        user,
        error: phoneValidation.message
      });
    }

    const update = {
      full_name: sanitizeInput(name),
      phone: sanitizeInput(mobile),
    };

    if (req.file) {
      update.profileImage = `/uploads/users/${req.file.filename}`;
    }

    await User.findByIdAndUpdate(
      req.session.userId,
      update,
      { runValidators: true }
    );

    res.redirect('/profile');
  } catch (err) {
    const user = await getUserById(req.session.userId);
    res.render('users/editProfile', {
      user,
      error: err.message || 'Failed to update profile'
    });
  }
};

//========================= address ================


export const addressPage = async (req, res) => {
  try {
    const userId = req.session.userId;

    const addresses = await Address.find({ user: userId });

    res.render('users/address', { addresses });
  } catch (err) {
    console.error(err);
    res.redirect('/profile');
  }
};

// ================= ADD ADDRESS PAGE =================
export const addAddressPage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.render('users/addAddress');
};



export const addAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect('/login');
    }

    const { label, name, phone, addressLine, city, state, pincode } = req.body;

    // Validate address data
    const addressValidation = validateAddress({
      label,
      name,
      phone,
      addressLine,
      city,
      state,
      pincode
    });

    if (!addressValidation.valid) {
      const firstError = Object.values(addressValidation.errors)[0];
      return res.render('users/addAddress', { error: firstError });
    }

    // Sanitize inputs
    await Address.create({
      user: userId,
      label: sanitizeInput(label),
      name: sanitizeInput(name),
      phone: sanitizeInput(phone),
      addressLine: sanitizeInput(addressLine),
      city: sanitizeInput(city),
      state: sanitizeInput(state),
      pincode: sanitizeInput(pincode),
    });

    res.redirect('/address');
  } catch (err) {
    console.error(err);
    res.render('users/addAddress', {
      error: err.message || 'Failed to add address'
    });
  }
};



export const editAddressPage = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const { id } = req.params;

    // Validate ObjectId
    const idValidation = validateObjectId(id);
    if (!idValidation.valid) {
      return res.redirect('/address');
    }

    const address = await Address.findOne({
      _id: id,
      user: req.session.userId
    });

    if (!address) {
      return res.redirect('/address');
    }

    res.render('users/editAddress', { address });
  } catch (err) {
    console.error(err);
    res.redirect('/address');
  }
};


export const updateAddress = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const { id } = req.params;

    // Validate ObjectId
    const idValidation = validateObjectId(id);
    if (!idValidation.valid) {
      return res.redirect('/address');
    }

    // Check ownership
    const existingAddress = await Address.findOne({
      _id: id,
      user: req.session.userId
    });

    if (!existingAddress) {
      return res.redirect('/address');
    }

    const {
      label,
      name,
      phone,
      addressLine,
      city,
      state,
      pincode,
    } = req.body;

    // Validate address data
    const addressValidation = validateAddress({
      label,
      name,
      phone,
      addressLine,
      city,
      state,
      pincode
    });

    if (!addressValidation.valid) {
      const firstError = Object.values(addressValidation.errors)[0];
      return res.render('users/editAddress', {
        address: existingAddress,
        error: firstError
      });
    }

    // Sanitize and update
    await Address.findByIdAndUpdate(
      id,
      {
        label: sanitizeInput(label),
        name: sanitizeInput(name),
        phone: sanitizeInput(phone),
        addressLine: sanitizeInput(addressLine),
        city: sanitizeInput(city),
        state: sanitizeInput(state),
        pincode: sanitizeInput(pincode),
      },
      { runValidators: true }
    );

    res.redirect('/address');
  } catch (err) {
    console.error(err);
    res.redirect('/address');
  }
};

// ================= DELETE ADDRESS =================
export const deleteAddress = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const { id } = req.params;

    // Validate ObjectId
    const idValidation = validateObjectId(id);
    if (!idValidation.valid) {
      return res.redirect('/address');
    }

    await Address.deleteOne({
      _id: id,
      user: req.session.userId,
    });

    res.redirect('/address');
  } catch (err) {
    console.error('Delete address error:', err);
    res.redirect('/address');
  }
};




//================home=================//
export const HomePage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('users/homePage');
};

export const collectionPage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('users/collections');
};
