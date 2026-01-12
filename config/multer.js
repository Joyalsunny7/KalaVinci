import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const userUploadDir = path.join(__dirname, '../public/uploads/users');
if (!fs.existsSync(userUploadDir)) {
  fs.mkdirSync(userUploadDir, { recursive: true });
}

const productUploadDir = path.join(__dirname, '../public/uploads/products');
if (!fs.existsSync(productUploadDir)) {
  fs.mkdirSync(productUploadDir, { recursive: true });
}

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userUploadDir);
  },
  filename: (req, file, cb) => {
    if (!req.session || !req.session.userId) {
      return cb(new Error('User session not found'), null);
    }
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.session.userId}-${uniqueSuffix}${ext}`);
  }
});

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (req, file, cb) => {
    const userPart = (req.session && req.session.userId) ? req.session.userId : 'anon';
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${userPart}-prod-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
    }
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const uploadProfilePhoto = multer({
  storage: userStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
});

export const uploadProductImages = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 6 * 1024 * 1024, // per file
    files: 50, // allow up to 50 files per upload
  }
});
