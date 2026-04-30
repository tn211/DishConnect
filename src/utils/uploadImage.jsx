import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const RecipeImage = ({ url, size, onUpload }) => {
  const [recipeImageUrl, setRecipeImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage
        .from("recipe-images")
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setRecipeImageUrl(url);
    } catch (error) {
      console.log("Error downloading image:", error.message);
    }
  }

  async function uploadImage(event) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExtension}`;
      const filePath = `recipe-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath); // Call the provided onUpload function with the file path
      downloadImage(filePath); // Optionally download and set the image URL for immediate display
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {recipeImageUrl ? (
        <img
          src={recipeImageUrl}
          alt="Recipe"
          className="recipe-image"
          style={{ height: size, width: size, borderRadius: "50%" }}
        />
      ) : (
        <div
          className="recipe-no-image"
          style={{
            height: size,
            width: size,
            borderRadius: "50%",
            backgroundColor: "#ccc",
          }}
        />
      )}
      <div style={{ marginTop: "10px" }}>
        <label
          className="button primary block"
          htmlFor="recipe-image-upload"
          style={{ cursor: "pointer" }}
        >
          {uploading ? "Uploading ..." : "Upload Image"}
        </label>
        <input
          style={{ visibility: "hidden", position: "absolute" }}
          type="file"
          id="recipe-image-upload"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default RecipeImage;
