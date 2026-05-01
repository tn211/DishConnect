import React, { useEffect, useState } from "react";
import { supabase, BASE_URL, recipeBucketPath } from "../../supabaseClient";
import Layout from "../../components/layout-components/Layout";
import { Link } from "react-router-dom";
import foodplaceholder from "../../assets/placeholder.png";

const RecentRecipesPage = () => {
  const pageSize = 10;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchRecentRecipes = async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select(
          `*, image_url, ingredients (ingredient_id, name, quantity, recipe_id)`,
        )
        .order("created_at", { ascending: false })
        .range(0, pageSize - 1);

      if (error) {
        console.error("Error fetching recent recipes:", error);
        setLoading(false);
        return;
      }

      setRecipes(data);
      setHasMore(data.length === pageSize);
      setLoading(false);
    };

    fetchRecentRecipes();
  }, []);

  const loadMoreRecipes = async () => {
    setLoadingMore(true);

    const from = recipes.length;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("recipes")
      .select(`*, image_url, ingredients (ingredient_id, name, quantity, recipe_id)`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error loading more recipes:", error);
      setLoadingMore(false);
      return;
    }

    setRecipes((currentRecipes) => [...currentRecipes, ...data]);
    setHasMore(data.length === pageSize);
    setLoadingMore(false);
  };

  const getFullImageUrl = (imagePath) => {
    return `${BASE_URL}/${recipeBucketPath}/${imagePath}`;
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f] px-4 py-10 max-w-5xl mx-auto">
        <h1 className="pixel-ui text-3xl font-semibold text-white mb-1 tracking-tight">
          Explore
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          The latest recipes from our contributors.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recipes.map((recipe, index) => (
                <Link
                  to={`/recipes/${recipe.recipe_id}`}
                  key={`${recipe.recipe_id}-${index}`}
                  className="group bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-all"
                >
                  <div className="aspect-video w-full overflow-hidden">
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
                  <div className="p-4">
                    <h2 className="text-white font-medium text-base">
                      {recipe.title}
                    </h2>
                    {recipe.description && (
                      <p className="text-neutral-400 text-sm mt-1 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={loadMoreRecipes}
                  disabled={loadingMore}
                  className="pixel-ui bg-fuchsia-500 hover:bg-fuchsia-400 disabled:bg-fuchsia-500/50 disabled:cursor-not-allowed text-white text-[10px] font-medium px-5 py-3 rounded-xl transition-colors"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecentRecipesPage;
