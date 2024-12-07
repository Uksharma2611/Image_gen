import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';  // If using Cloudinary
import Post from '../mongodb/models/post.js';
import fs from 'fs';  // Optional: only if saving images locally
import path from 'path';

dotenv.config();

const router = express.Router();

// Cloudinary Configuration (optional, if you're uploading to Cloudinary)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CREATE A POST
router.post('/', async (req, res) => {
  try {
    const { name, prompt, photo } = req.body;

    if (!name || !prompt || !photo) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Convert the base64 photo to a buffer
    const base64Data = photo.split(';base64,').pop();
    const buffer = Buffer.from(base64Data, 'base64');

    // Option 1: Save to Cloudinary (recommended)
    const cloudinaryUpload = await cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },  // This will automatically detect the file type
      async (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, message: error.message });
        }

        const newPost = await Post.create({
          name,
          prompt,
          photo: result.secure_url,  // Store Cloudinary URL
        });

        return res.status(201).json({ success: true, data: newPost });
      }
    );
    
    cloudinaryUpload.end(buffer);

    // Option 2: Save Locally (Alternative to Cloudinary)
    /*
    const imagePath = path.join(__dirname, 'uploads', `${Date.now()}.png`);
    fs.writeFileSync(imagePath, buffer);
    
    // Save the post with the local image path
    const newPost = await Post.create({
      name,
      prompt,
      photo: imagePath,  // Save the local file path
    });
    res.status(201).json({ success: true, data: newPost });
    */

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();  // Fetch posts from the database

    if (!posts || posts.length === 0) {
      return res.status(404).json({ success: false, message: 'No posts found' });
    }

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
