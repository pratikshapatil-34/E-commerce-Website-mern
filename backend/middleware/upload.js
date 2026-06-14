import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload single image
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    const file = req.files.image || req.files.avatar || req.files.file;

    if (!file) {
      return next();
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file (jpeg, png, gif, webp)',
      });
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'File size cannot exceed 5MB',
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `shopverse/${req.uploadFolder || 'general'}`,
      width: req.imageWidth || 800,
      crop: 'limit',
      quality: 'auto:good',
    });

    // Delete temp file
    if (fs.existsSync(file.tempFilePath)) {
      fs.unlinkSync(file.tempFilePath);
    }

    req.imageUrl = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    next();
  } catch (err) {
    console.error(err);
    // Clean up temp file on error
    if (req.files) {
      const file = req.files.image || req.files.avatar || req.files.file;
      if (file && file.tempFilePath && fs.existsSync(file.tempFilePath)) {
        fs.unlinkSync(file.tempFilePath);
      }
    }
    return res.status(500).json({
      success: false,
      error: 'Image upload failed',
    });
  }
};

// Upload multiple images
export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    let files = req.files.images || req.files.files;

    if (!files) {
      return next();
    }

    // Convert to array if single file
    if (!Array.isArray(files)) {
      files = [files];
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFile = files.find(
      (file) => !allowedTypes.includes(file.mimetype) || file.size > 5 * 1024 * 1024
    );

    if (invalidFile) {
      // Clean up all temp files on validation failure
      files.forEach((file) => {
        if (fs.existsSync(file.tempFilePath)) {
          fs.unlinkSync(file.tempFilePath);
        }
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid file type or size. Only images (jpeg, png, gif, webp) up to 5MB allowed.',
      });
    }

    // Upload all files to cloudinary
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.tempFilePath, {
        folder: `shopverse/${req.uploadFolder || 'products'}`,
        width: req.imageWidth || 800,
        crop: 'limit',
        quality: 'auto:good',
      })
    );

    const results = await Promise.all(uploadPromises);

    // Delete temp files
    files.forEach((file) => {
      if (fs.existsSync(file.tempFilePath)) {
        fs.unlinkSync(file.tempFilePath);
      }
    });

    req.imageUrls = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));

    next();
  } catch (err) {
    console.error(err);
    // Clean up all temp files on error
    if (req.files) {
      let files = req.files.images || req.files.files;
      if (files) {
        if (!Array.isArray(files)) {
          files = [files];
        }
        files.forEach((file) => {
          if (fs.existsSync(file.tempFilePath)) {
            fs.unlinkSync(file.tempFilePath);
          }
        });
      }
    }
    return res.status(500).json({
      success: false,
      error: 'Image upload failed',
    });
  }
};

// Delete image from cloudinary
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
