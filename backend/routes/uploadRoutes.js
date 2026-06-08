import path from 'path';
import express from 'express';
import multer from 'multer';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();

const storage = multer.diskStorage ({
  destination(req,file,cb) {
    cb(null,'uploads/');
  },
  filename(req,file,cb) {
    cb(null,`${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);

  }
});

  function checkFileType(file, cb) {
    const filetypes = /jpe?g|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }

    cb(new Error('Images only. Please upload a JPG, JPEG, or PNG file.'));
  }

  const upload = multer({
    storage,
    fileFilter(req, file, cb) {
      checkFileType(file, cb);
    },
    limits: {
      fileSize: 3 * 1024 * 1024,
    },
  });

  router.post ('/', protect, admin, upload.single ('image'), (req,res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file');
    }

    res.send({
    message: 'Image Uploaded',
    image: `/${req.file.path}`
    });
  })

export default router;
