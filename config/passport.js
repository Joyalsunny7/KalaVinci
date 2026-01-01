import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(new Error('No email found in Google profile'), null);
        }

        const email = profile.emails[0].value.toLowerCase().trim();
        const displayName = profile.displayName || 'User';

        let user = await User.findOne({ email });

        if (!user) {
          
          user = await User.create({
            full_name: displayName,
            email: email,
            googleId: profile.id,
          });
        } else {
          
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          } else if (user.googleId !== profile.id) {
            return done(new Error('This email is already registered with a different Google account'), null);
          }

         
          if (user.isBlocked) {
            return done(new Error('Your account has been blocked'), null);
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
