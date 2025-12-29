import 'dotenv/config';

import express from 'express';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';
import connectDB from './config/db.js';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/authRoutes/adminRoutes.js'
import authRoutes from './routes/authRoutes/authRoutes.js';
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

app.use('/', authRoutes);
app.use('/auth',authgoogleroutes)
app.use('/admin', adminRoutes)

console.log("Admin routes mounted");


await connectDB();

app.listen(port, () => {
  console.log(` Server running at : http://localhost:${port}`);
});
