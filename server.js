import 'dotenv/config';
import { checkBlocked, Toasted } from './middlewares/adminAuth.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import express from 'express';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';
import connectDB from './config/db.js';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/authRoutes/adminRoutes.js'
import userRoutes from './routes/authRoutes/userRoutes.js';
import authgoogleroutes from './routes/authRoutes/googleAuthRoutes.js';

const app = express();
const port = process.env.PORT || 7071;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use(
  session({
    secret: 'kala-vinci-secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.use(checkBlocked);
app.use(Toasted);
app.use('/', userRoutes);
app.use('/auth', authgoogleroutes);
app.use('/admin', adminRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

console.log("Admin routes mounted");


await connectDB();

app.listen(port, () => {
  console.log(` Server running at : http://localhost:${port}`);
});
