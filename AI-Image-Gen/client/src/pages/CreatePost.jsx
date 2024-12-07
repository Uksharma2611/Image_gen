import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { preview } from "../assets";
import { getRandomPrompt } from "../utils";
import { FormField, Loader } from "../components";

const CreatePost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    prompt: "",
    photo: "",
  });

  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (form.prompt && form.photo) {
      setLoading(true);
  
      try {
        // Convert the Blob URL to a Blob object and then to a Base64 string
        const photoBase64 = await getBase64(form.photo); // This will now fetch and convert the Blob URL
  
        const response = await fetch('https://image-gen-johp.onrender.com/api/v1/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            prompt: form.prompt,
            photo: photoBase64, // Send base64 string to backend
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to create post: ${response.status}`);
        }
  
        const result = await response.json();
        navigate('/');
      } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again later.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please provide a valid prompt and image.');
    }
  };
  
  // Helper function to convert Blob URL to Base64 string
  const getBase64 = (blobUrl) => {
    return new Promise((resolve, reject) => {
      fetch(blobUrl) // Fetch the Blob URL to get the Blob object
        .then(response => response.blob()) // Convert the response to a Blob object
        .then(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob); // Convert Blob to Base64
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
        })
        .catch(reject);
    });
  };
  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  const generateImage = async () => {
    if (form.prompt) {
      try {
        setGeneratingImg(true);

        const response = await fetch("https://image-gen-johp.onrender.com/api/v1/dalle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: form.prompt }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate image: ${response.status}`);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setForm({ ...form, photo: imageUrl });
      } catch (error) {
        console.error("Error generating image:", error);
        alert("Error generating image. Please try again.");
      } finally {
        setGeneratingImg(false);
      }
    } else {
      alert("Please enter a prompt.");
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">Create</h1>
        <p className="mt-2 text-[#666e75] text-[16px] max-w-[500px]">
          Create imaginative and visually stunning images through Gen-I and
          share them with the community
        </p>
      </div>

      <form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <FormField
            LabelName="Your Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            handleChange={handleChange}
          />
        </div>
      </form>

      <form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <FormField
            LabelName="Prompt"
            type="text"
            name="prompt"
            placeholder="A plush toy robot sitting against a yellow wall"
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe
            handleSurpriseMe={handleSurpriseMe}
          />

          <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
            {form.photo ? (
              <img
                src={form.photo}
                alt={form.prompt}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-9/12 h-9/12 object-contain opacity-40"
              />
            )}

            {generatingImg && (
              <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)]">
                <Loader />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-5">
          <button
            type="button"
            onClick={generateImage}
            className="text-white bg-green-700 font-medium rounded-md text-sm w-full sm:w-auto px-7 py-2.5 text-center"
          >
            {generatingImg ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="mt-10">
          <p className="mt-2 text-[#666e75] text-[14px]">
            Once you have created the image you want, you can share it with the
            community.
          </p>
          <button
            type="submit"
            className="mt-3 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {loading ? "Sharing..." : "Share with the community."}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;
