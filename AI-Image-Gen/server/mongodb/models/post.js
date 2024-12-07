import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prompt: { type: String, required: true },
  photo: { type: String, required: true }, // URL for the Cloudinary image
});

const Post = mongoose.model("Post", PostSchema);
export default Post;
