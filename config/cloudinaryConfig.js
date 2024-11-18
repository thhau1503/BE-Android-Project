const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dcq5r96bw',
    api_key: '653145141552884',
    api_secret: 'SNL6Go0SDYZNab0irfOoBtKT6h8'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'imgvideodb',
        format: async (req, file) => {
            const mimeType = file.mimetype.split('/')[0];
            if (mimeType === 'image') {
                return 'jpg'; // or 'png', 'gif', etc.
            } else if (mimeType === 'video') {
                return 'mp4'; // or 'avi', 'mov', etc.
            }
            return 'jpg'; // default format
        }, 
        public_id: (req, file) => file.originalname.split('.')[0] 
    }
});

const upload = multer({
    storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: (req, file) => {
          const mimeType = file.mimetype.split('/')[0];
          return mimeType === 'image' ? 'posts/images' : 'posts/videos';
        },
        format: async (req, file) => {
          const mimeType = file.mimetype.split('/')[0];
          return mimeType === 'image' ? 'jpg' : 'mp4';
        },
        resource_type: (req, file) => {
          const mimeType = file.mimetype.split('/')[0];
          return mimeType === 'image' ? 'image' : 'video';
        },
        public_id: (req, file) => file.originalname.split('.')[0]
      }
    })
  });

module.exports = {cloudinary, upload};