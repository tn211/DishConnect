import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import foodplaceholder from "../../assets/placeholder.png";
import { BASE_URL, recipeBucketPath } from "../../supabaseClient";

const RecipesList = ({ supabase, userId }) => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    console.log(`Fetching recipes for userId: ${userId}`);
    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("title, recipe_id, image_url")
        .eq("profile_id", userId);

      if (error) {
        console.error("Error fetching recipes", error);
      } else {
        console.log("Fetched recipes data:", data);
        setRecipes(data);
      }
    };

    fetchRecipes();
  }, [supabase, userId]);

  const getFullImageUrl = (imagePath) => {
    //const baseUrl =
    // "https://nwooccvnjqofbuqftrep.supabase.co/storage/v1/object/public/recipe-images";
    // return `${baseUrl}/${imagePath}`;
    // const imgBucket = "/storage/v1/object/public/recipe-images"
    return `${BASE_URL}/${recipeBucketPath}/${imagePath}`;
  };

  console.log("Rendering, recipes count:", recipes.length);

  return (
    <div>
      {recipes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <Link
              to={`/recipes/${recipe.recipe_id}`}
              key={recipe.recipe_id}
              className="group bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-all"
            >
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={
                    recipe.image_url
                      ? getFullImageUrl(recipe.image_url)
                      : foodplaceholder
                  }
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-white text-sm font-medium px-3 py-2 truncate">
                {recipe.title}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-sm">No recipes found.</p>
      )}
    </div>
  );
};

export default RecipesList;
