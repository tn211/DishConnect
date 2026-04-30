import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Layout from "../../components/layout-components/Layout";
import { supabase, BASE_URL, recipeBucketPath } from "../../supabaseClient";
import FavoriteButton from "../../components/favorite-button/FavoriteButton";
import RatingButtons from "../../components/rating-buttons/RatingButtons";
import Comments from "../../components/comments/Comments";
import foodplaceholder from "../../assets/placeholder.png";

const RecipeDetail = ({ session }) => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [averageRating, setAverageRating] = useState("Not yet rated");
  const [submitter, setSubmitter] = useState("Unknown");
  const [submitterId, setSubmitterId] = useState(null);

  const fetchRecipeAndComments = useCallback(async () => {
    setLoading(true);

    if (!session || !session.user) {
      console.error("User is not logged in");
      setLoading(false);
      return;
    }

    try {
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select(
          `
          *,
          image_url,
          ingredients(ingredient_id, name, quantity, unit),
          profile_id,
          steps(step_id, instruction, step_number)
        `,
        )
        .eq("recipe_id", recipeId)
        .single();

      if (recipeError) throw recipeError;

      setRecipe(recipeData);
      setSubmitterId(recipeData.profile_id);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", recipeData.profile_id)
        .single();

      if (profileError) throw profileError;
      setSubmitter(profileData.username);

    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  }, [recipeId, session]);

  const checkFavorite = useCallback(async () => {
    if (session && session.user) {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("recipe_id", recipeId)
        .eq("profile_id", session.user.id);

      if (error) {
        console.error("Error checking favorite status:", error);
      } else {
        setIsFavorite(data.length > 0);
      }
    }
  }, [recipeId, session]);

  const fetchRatings = useCallback(async () => {
    const { error: ratingsError } = await supabase
      .from("ratings")
      .select("*")
      .eq("recipe_id", recipeId);

    if (ratingsError) {
      console.error("Error fetching ratings:", ratingsError);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchRecipeAndComments();
    fetchRatings();
    checkFavorite();
  }, [fetchRecipeAndComments, fetchRatings, checkFavorite]);

  const getFullImageUrl = (imagePath) => {
    return `${BASE_URL}/${recipeBucketPath}/${imagePath}`;
  };

  const formatTime = (totalMinutes) => {
    if (totalMinutes === "--") return "--";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} ` : ""}${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-neutral-500">Recipe not found.</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f]">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h2 className="text-3xl font-semibold text-white mb-2 tracking-tight">
            {recipe.title}
          </h2>
          <p className="text-sm text-neutral-500 mb-1">
            Submitted by:{" "}
            {submitterId ? (
              <Link
                to={`/chefs/${submitterId}`}
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                {submitter}
              </Link>
            ) : (
              <span>Unknown</span>
            )}
          </p>
          <div className="flex gap-4 text-sm text-neutral-400 mb-4">
            <span>
              Prep:{" "}
              <span className="text-white">{formatTime(recipe.prep_time)}</span>
            </span>
            <span>
              Cook:{" "}
              <span className="text-white">{formatTime(recipe.cook_time)}</span>
            </span>
          </div>
          {recipe.description && (
            <p className="text-neutral-300 mb-6 leading-relaxed">
              {recipe.description}
            </p>
          )}

          <div className="w-full rounded-2xl overflow-hidden mb-8 aspect-video">
            <img
              src={
                recipe.image_url
                  ? getFullImageUrl(recipe.image_url)
                  : foodplaceholder
              }
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
              <h3 className="text-neutral-400 font-medium mb-3 text-sm uppercase tracking-wider">
                Ingredients
              </h3>
              <ul className="flex flex-col gap-2">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.ingredient_id}
                    className="flex items-start gap-2 text-sm text-neutral-300"
                  >
                    <span className="text-orange-400 mt-0.5">•</span>
                    {ingredient.quantity}{" "}
                    {ingredient.unit !== "whole" ? ingredient.unit + " " : ""}
                    {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
              <h3 className="text-neutral-400 font-medium mb-3 text-sm uppercase tracking-wider">
                Instructions
              </h3>
              <ol className="flex flex-col gap-3">
                {recipe.steps &&
                  recipe.steps
                    .sort((a, b) => a.step_number - b.step_number)
                    .map((step, i) => (
                      <li
                        key={step.step_id}
                        className="flex gap-3 text-sm text-neutral-300"
                      >
                        <span className="text-orange-400 font-medium shrink-0">
                          {i + 1}.
                        </span>
                        {step.instruction}
                      </li>
                    ))}
              </ol>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <FavoriteButton
              recipeId={recipeId}
              isFavorite={isFavorite}
              setIsFavorite={setIsFavorite}
              session={session}
            />
            <RatingButtons recipeId={recipeId} session={session} />
          </div>

          <div className="mt-8">
            <Comments recipeId={recipeId} session={session} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecipeDetail;
