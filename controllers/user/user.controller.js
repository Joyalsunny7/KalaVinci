import {
  signupWithOtp,
  verifyOtpAndSignup,
  sendForgotOtp,
  verifyForgototp,
  resetPasswordService,
  loginService,
} from "../../services/user/userauth.service.js";

import { getUserById } from "../../services/user/user.service.js";
import User from "../../models/user/user.model.js";
import Address from "../../models/user/address.model.js";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateOtp,
  validateAddress,
  validateObjectId,
  sanitizeInput,
} from "../../utils/validators.js";

// ================= auth ================= //

export const Login = (req, res) => {
  res.render("users/login");
};

export const PostLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("users/login", {
        message: "Email and password are required",
      });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.render("users/login", {
        message: emailValidation.message,
      });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();
    const user = await loginService(sanitizedEmail, password);
    req.session.userId = user._id;

    res.redirect("/home");
  } catch (error) {
    res.render("users/login", { message: error.message });
  }
};

// ================= LOGOUT ================= //

export const Logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.redirect("/home");
      }
      res.clearCookie("connect.sid");
      return res.redirect("/login");
    });
  } catch (error) {
    console.error("Logout failed:", error);
    res.redirect("/home");
  }
};

export const Signup = (req, res) => {
  res.render("users/signup");
};

export const PostSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return res.render("users/signup", { error: nameValidation.message });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.render("users/signup", { error: emailValidation.message });
    }

    // Validate phone
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return res.render("users/signup", { error: phoneValidation.message });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.render("users/signup", { error: passwordValidation.message });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email).toLowerCase().trim(),
      phone: sanitizeInput(phone),
      password: password,
    };

    await signupWithOtp(sanitizedData, req.session);
    res.redirect("/verify-otp");
  } catch (err) {
    res.render("users/signup", { error: err.message });
  }
};

// ================= OTP page ================= //

export const VerifyOtpPage = (req, res) => {
  if (
    !req.session.tempUser &&
    !req.session.resetPassword &&
    !req.session.emailReset
  ) {
    return res.redirect("/login");
  }

  const email =
    req.session.tempUser?.email ||
    req.session.resetPassword?.email ||
    req.session.emailReset?.newEmail ||
    req.session.emailReset?.email;

  // Calculate remaining time
  let remainingTime = 0;
  if (req.session.tempUser?.otpExpiry) {
    remainingTime = Math.max(
      0,
      Math.floor((req.session.tempUser.otpExpiry - Date.now()) / 1000)
    );
  } else if (req.session.resetPassword?.expiresAt) {
    remainingTime = Math.max(
      0,
      Math.floor((req.session.resetPassword.expiresAt - Date.now()) / 1000)
    );
  } else if (req.session.emailReset?.otpExpiry) {
    remainingTime = Math.max(
      0,
      Math.floor((req.session.emailReset.otpExpiry - Date.now()) / 1000)
    );
  }

  res.render("users/verifyOtp", {
    email,
    remainingTime,
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
        message: "No active OTP session found",
      });
    }

    let email;
    if (req.session.tempUser) {
      // Resend OTP for signup
      const tempUserData = {
        name: req.session.tempUser.full_name,
        email: req.session.tempUser.email,
        phone: req.session.tempUser.phone,
        password: req.session.tempUser.password,
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
      remainingTime = Math.max(
        0,
        Math.floor((req.session.tempUser.otpExpiry - Date.now()) / 1000)
      );
    } else if (req.session.resetPassword?.expiresAt) {
      remainingTime = Math.max(
        0,
        Math.floor((req.session.resetPassword.expiresAt - Date.now()) / 1000)
      );
    } else if (req.session.emailReset?.otpExpiry) {
      remainingTime = Math.max(
        0,
        Math.floor((req.session.emailReset.otpExpiry - Date.now()) / 1000)
      );
    }

    return res.json({
      success: true,
      message: "OTP resent successfully",
      remainingTime,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
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
        req.session.emailReset?.newEmail ||
        req.session.emailReset?.email ||
        "";
      return res.render("users/verifyOtp", {
        error: otpValidation.message,
        email,
        remainingTime: 300,
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

      req.session.resetPassword = {
        email: req.session.resetPassword.email,
        verified: true,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };

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
  res.render("users/forgotPassword");
};

export const PostForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.render("users/forgotPassword", {
        error: emailValidation.message,
      });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();

    await sendForgotOtp(sanitizedEmail, req.session);
    return res.redirect("/verify-otp");
  } catch (err) {
    return res.render("users/forgotPassword", {
      error: err.message,
    });
  }
};

export const ResetPasswordPage = (req, res) => {
  if (!req.session.resetPassword) {
    return res.redirect("/forgot-password");
  }

  res.render("users/resetPassword");
};

export const PostResetPassword = async (req, res) => {
  try {
   

    const resetSession = req.session.resetPassword;

    if (!resetSession || !resetSession.verified) {
      return res.redirect("/forgot-password");
    }

    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.render("users/resetPassword", {
        error: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.render("users/resetPassword", {
        error: "Passwords do not match",
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.render("users/resetPassword", {
        error: passwordValidation.message,
      });
    }

    await resetPasswordService(resetSession.email, password);

  
    delete req.session.resetPassword;

    return res.redirect("/login?reset=success");
  } catch (err) {
  
    return res.render("users/resetPassword", {
      error: "Something went wrong. Try again.",
    });
  }
};

// Email reset and profile-related handlers moved to `controllers/user/profileController.js`

//========================= address ================

export const addressPage = async (req, res) => {
  try {
    const userId = req.session.userId;

    const addresses = await Address.find({ user: userId });

    res.render("users/address", { addresses });
  } catch (err) {
    console.error(err);
    res.redirect("/profile");
  }
};

// ================= ADD ADDRESS PAGE =================
export const addAddressPage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  res.render("users/addAddress");
};

export const addAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect("/login");
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
      pincode,
    });

    if (!addressValidation.valid) {
      const firstError = Object.values(addressValidation.errors)[0];
      return res.render("users/addAddress", { error: firstError });
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

    res.redirect("/address");
  } catch (err) {
    console.error(err);
    res.render("users/addAddress", {
      error: err.message || "Failed to add address",
    });
  }
};

export const editAddressPage = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const { id } = req.params;

    // Validate ObjectId
    const idValidation = validateObjectId(id);
    if (!idValidation.valid) {
      return res.redirect("/address");
    }

    const address = await Address.findOne({
      _id: id,
      user: req.session.userId,
    });

    if (!address) {
      return res.redirect("/address");
    }

    res.render("users/editAddress", { address });
  } catch (err) {
    console.error(err);
    res.redirect("/address");
  }
};

export const updateAddress = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const { id } = req.params;

    // Validate ObjectId
    const idValidation = validateObjectId(id);
    if (!idValidation.valid) {
      return res.redirect("/address");
    }

    // Check ownership
    const existingAddress = await Address.findOne({
      _id: id,
      user: req.session.userId,
    });

    if (!existingAddress) {
      return res.redirect("/address");
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
      pincode,
    });

    if (!addressValidation.valid) {
      const firstError = Object.values(addressValidation.errors)[0];
      return res.render("users/editAddress", {
        address: existingAddress,
        error: firstError,
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

    res.redirect("/address");
  } catch (err) {
    console.error(err);
    res.redirect("/address");
  }
};

// ================= DELETE ADDRESS =================
export const deleteAddress = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const { id } = req.params;

    // Validate ObjectId
    const idValidation = validateObjectId(id);
    if (!idValidation.valid) {
      return res.redirect("/address");
    }

    await Address.deleteOne({
      _id: id,
      user: req.session.userId,
    });

    res.redirect("/address");
  } catch (err) {
    console.error("Delete address error:", err);
    res.redirect("/address");
  }
};

//================home=================//
export const HomePage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  res.render("users/homePage");
};

export const collectionPage = (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  res.render("users/collections");
};
