import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function RecipeImageUploader({
  url,
  size,
  onUpload = (filePath) => console.log("Uploaded file path:", filePath),
}) {
  const [recipeImageUrl, setRecipeImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadRecipeImage(url);
  }, [url]);

  async function downloadRecipeImage(path) {
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
      console.log("Error downloading recipe image: ", error.message);
    }
  }

  async function uploadRecipeImage(event) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading file:", file);
      console.log("File path:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
    } catch (error) {
      console.error("Error uploading recipe image:", error);
    } finally {
      setUploading(false); // Ensure setUploading is set to false in both success and error cases
    }
  }

  return (
    <div>
      {recipeImageUrl ? (
        <img
          src={recipeImageUrl}
          alt="Recipe"
          className="recipe-image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div
          className="recipe-image no-image"
          style={{ height: size, width: size }}
        />
      )}
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? "Uploading ..." : "Upload Image"}
        </label>
        <input
          style={{
            visibility: "hidden",
            position: "absolute",
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadRecipeImage}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
