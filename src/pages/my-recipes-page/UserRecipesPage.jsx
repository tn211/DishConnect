import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import RecipeList from "../../components/recipe-list/RecipeList";
import Layout from "../../components/layout-components/Layout";

const UserRecipesPage = ({ session }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect triggered in UserRecipesPage");

    if (!session || !session.user) {
      console.log("Session or session.user is not available");
      setLoading(false);
      return;
    }

    console.log("Session is available, proceeding to fetch recipes");

    const fetchRecipes = async () => {
      console.log(`Fetching recipes for user ID: ${session.user.id}`);

      const { data, error } = await supabase
        .from("recipes")
        .select(
          `
          *,
          ingredients (
            ingredient_id,
            name,
            quantity,
            recipe_id
          )
        `,
        )
        .eq("profile_id", session.user.id);

      if (error) {
        console.error("Error fetching recipes:", error);
        setLoading(false);
        return;
      }

      console.log("Recipes and ingredients fetched successfully:", data);
      setRecipes(data);
      setLoading(false);
    };

    fetchRecipes();
  }, [session]); // Re-run useEffect when the session changes

  console.log(
    `Rendering UserRecipesPage, Recipes Count: ${recipes.length}, Loading: ${loading}`,
  );

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f] px-4 py-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-1 tracking-tight">
          My Recipes
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Recipes you&apos;ve uploaded
        </p>
        {session && supabase ? (
          <RecipeList supabase={supabase} userId={session.user.id} />
        ) : (
          <p className="text-neutral-500">Loading or not authenticated…</p>
        )}
      </div>
    </Layout>
  );
};

export default UserRecipesPage;
