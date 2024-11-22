const express = require('express');
const { upload } = require('../config/cloudinaryConfig');
const router = express.Router();

router.post('/image', upload.single('file'), (req, res) => {
  try {
    const fileUrl = req.file.path; 
    res.status(200).json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
