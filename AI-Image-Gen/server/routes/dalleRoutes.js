import express from 'express';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const router = express.Router();
const HF_API_KEY = process.env.HF_API_KEY;

async function query(data) {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large", {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error response body:", errorBody);
      throw new Error(`HTTP error! Status: ${response.status} - ${errorBody}`);
    }

    const result = await response.blob();
    return result;
  } catch (error) {
    console.error("Error in query:", error);
    throw error;
  }
}

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).send('Valid prompt is required');
    }

    console.log("Received prompt:", prompt);

    const imageBlob = await query({
      "inputs": prompt,
      "parameters": {
        "width": 1024,
        "height": 1024,
        "guidance_scale": 8.5,
        
      }
    });

    const buffer = await imageBlob.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send(error.message || 'Something went wrong');
  }
});

export default router;
