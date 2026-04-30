import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, BASE_URL, recipeBucketPath } from "../../supabaseClient";
import Layout from "../../components/layout-components/Layout";
import foodplaceholder from "../../assets/placeholder.png";

const UserFavouritesPage = ({ session }) => {
  const [favouriteRecipes, setFavouriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavouriteRecipes = async () => {
      if (!session || !session.user) {
        console.log("Session or session.user is not available");
        setLoading(false);
        return;
      }

      const profileId = session.user.id;
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("recipe_id")
        .eq("profile_id", profileId);

      if (likesError) {
        console.error("Error fetching favourite recipes:", likesError);
        setLoading(false);
        return;
      }

      if (likesData.length === 0) {
        setLoading(false);
        return;
      }

      const recipeIds = likesData.map((like) => like.recipe_id);

      const { data: recipesData, error: recipesError } = await supabase
        .from("recipes")
        .select("recipe_id, title, image_url") // Select image_url along with other fields
        .in("recipe_id", recipeIds);

      if (recipesError) {
        console.error("Error fetching recipes based on likes:", recipesError);
        setLoading(false);
        return;
      }

      setFavouriteRecipes(recipesData);
      setLoading(false);
    };

    fetchFavouriteRecipes();
  }, [session]);

  const getFullImageUrl = (imagePath) => {
    // const baseUrl =
    //   "https://nwooccvnjqofbuqftrep.supabase.co/storage/v1/object/public/recipe-images";
    // return imagePath ? `${baseUrl}/${imagePath}` : foodplaceholder;
    // const imgBucket = "/storage/v1/object/public/recipe-images"
    return imagePath
      ? `${BASE_URL}/${recipeBucketPath}/${imagePath}`
      : foodplaceholder;
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f] px-4 py-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-1 tracking-tight">
          My Favourites
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Recipes you&apos;ve saved
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : favouriteRecipes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {favouriteRecipes.map((recipe) => (
              <Link
                to={`/recipes/${recipe.recipe_id}`}
                key={recipe.recipe_id}
                className="group bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-all"
              >
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={getFullImageUrl(recipe.image_url)}
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
          <p className="text-neutral-500 text-sm">
            You have no favourite recipes yet.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default UserFavouritesPage;
