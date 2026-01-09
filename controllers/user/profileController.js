import { sendForgotOtp } from "../../services/user/userauth.service.js";
import { getUserById } from "../../services/user/user.service.js";
import User from "../../models/user/user.model.js";
import { validateEmail, sanitizeInput, validateName, validatePhone } from "../../utils/validators.js";

export const startEmailReset = async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }

    req.session.emailReset = {
      step: "verify-old",
      email: user.email,
    };

    delete req.session.resetPassword;

    await sendForgotOtp(user.email, req.session);
    res.redirect("/verify-otp");
  } catch (err) {
    console.error("Error starting email reset:", err);
    res.redirect("/profile");
  }
};

export const emailResetPage = (req, res) => {
  if (!req.session.emailReset || req.session.emailReset.step !== "enter-new") {
    return res.redirect("/profile");
  }

  res.render("users/emailReset", {
    emailReset: req.session.emailReset,
  });
};

export const postEmailReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.render("users/emailReset", {
        error: emailValidation.message,
        emailReset: req.session.emailReset,
      });
    }

    // Check if new email is same as old email
    if (
      email.toLowerCase().trim() ===
      req.session.emailReset.email.toLowerCase().trim()
    ) {
      return res.render("users/emailReset", {
        error: "New email must be different from current email",
        emailReset: req.session.emailReset,
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res.render("users/emailReset", {
        error: "This email is already registered",
        emailReset: req.session.emailReset,
      });
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();
    req.session.emailReset.newEmail = sanitizedEmail;
    req.session.emailReset.step = "verify-new";

    await sendForgotOtp(sanitizedEmail, req.session);
    return res.redirect("/verify-otp");
  } catch (err) {
    res.render("users/emailReset", {
      error: err.message,
      emailReset: req.session.emailReset,
    });
  }
};

export const ProfileRedirect = async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const user = await User.findById(req.session.userId);
  res.render("users/ProfilePage", { user });
};

export const getEditProfile = async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const user = await getUserById(req.session.userId);
  res.render("users/editProfile", { user });
};

export const updateProfile = async (req, res) => {
  try {
    // Handle multer errors
    if (req.fileValidationError) {
      const user = await getUserById(req.session.userId);
      return res.render("users/editProfile", {
        user,
        error: req.fileValidationError,
      });
    }

    const { name, mobile } = req.body;

    if (!name || !mobile) {
      const user = await getUserById(req.session.userId);
      return res.render("users/editProfile", {
        user,
        error: "Name and mobile number are required",
      });
    }

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      const user = await getUserById(req.session.userId);
      return res.render("users/editProfile", {
        user,
        error: nameValidation.message,
      });
    }

    // Validate phone
    const phoneValidation = validatePhone(mobile);
    if (!phoneValidation.valid) {
      const user = await getUserById(req.session.userId);
      return res.render("users/editProfile", {
        user,
        error: phoneValidation.message,
      });
    }

    const update = {
      full_name: sanitizeInput(name),
      phone: sanitizeInput(mobile),
    };

    if (req.file) {
      update.profileImage = `/uploads/users/${req.file.filename}`;
    }

    await User.findByIdAndUpdate(req.session.userId, update, {
      runValidators: true,
    });

    res.redirect("/profile");
  } catch (err) {
    const user = await getUserById(req.session.userId);
    res.render("users/editProfile", {
      user,
      error: err.message || "Failed to update profile",
    });
  }
};
