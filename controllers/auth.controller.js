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
import Address from '../models/address.model.js'

// ================= auth ================= //

export const Login = (req, res) => {
  res.render('users/login');
};

export const PostLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginService(email, password);
    req.session.userId = user._id;
    res.redirect('/home');
  } catch (err) {
    res.render('users/login', { error: err.message });
  }
};

export const Signup = (req, res) => {
  res.render('users/signup');
};

export const PostSignup = async (req, res) => {
  
  try {
    await signupWithOtp(req.body, req.session);
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

  res.render('users/verifyOtp', { email });
};

// ================= OTP VERIFY ================= //

export const PostVerifyOtp = async (req, res) => {
  try {
    console.log("=== POST VERIFY OTP HIT ===");
    console.log("REQ BODY:", req.body);
    console.log("SESSION BEFORE VERIFY:", req.session);

    const { otp } = req.body;

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

        console.log("✅ OLD EMAIL VERIFIED");
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
  
    await sendForgotOtp(req.body.email, req.session);


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


    await resetPasswordService(email, req.body.password);
    req.session.resetPassword = null;

    res.redirect('/login');
  } catch (err) {
    res.render('users/resetPassword', { error: err.message });
  }
};

// ================= EMAIL RESET ================= //

export const startEmailReset = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const user = await User.findById(req.session.userId);

  req.session.emailReset = {
    step: 'verify-old',
    email: user.email,
  };

  delete req.session.resetPassword;

  await sendForgotOtp(user.email, req.session);
  res.redirect('/verify-otp');
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
    req.session.emailReset.newEmail = req.body.email;
    req.session.emailReset.step = 'verify-new';

    await sendForgotOtp(req.body.email, req.session);

    return res.redirect('/verify-otp');
  } catch (err) {
    res.render('users/emailReset', { error: err.message });
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
  const update = {
    full_name: req.body.name,
    phone: req.body.mobile,
  };

  if (req.file) {
    update.profileImage = `/uploads/users/${req.file.filename}`;
  }

  await User.findByIdAndUpdate(
    req.session.userId,
    update,
    { runValidators: false }
  );

  res.redirect('/profile');
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
  console.log('SESSION:', req.session);

  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.render('users/addAddress');
};



export const addAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    const {label, name, phone, addressLine, city, state, pincode } = req.body;

    await Address.create({
      user: userId,
      label,
      name,
      phone,
      addressLine,
      city,
      state,
      pincode,
    });

    res.redirect('/address');
  } catch (err) {
    console.error(err);
    res.redirect('/address');
  }
};



export const editAddressPage = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const address = await Address.findById(req.params.id);

    if (!address) return res.redirect('/address');

    res.render('users/editAddress', { address });
  } catch (err) {
    console.error(err);
    res.redirect('/address');
  }
};


export const updateAddress = async (req, res) => {
  try {
    const {
      label,
      name,
      phone,
      addressLine,
      city,
      state,
      pincode,
    } = req.body;

    await Address.findByIdAndUpdate(
      req.params.id,
      {
        label,
        name,
        phone,
        addressLine,
        city,
        state,
        pincode,
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
