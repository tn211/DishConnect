import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase, BASE_URL, recipeBucketPath } from "../../supabaseClient";
import Layout from "../../components/layout-components/Layout";
import foodplaceholder from "../../assets/placeholder.png";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
  const [results, setResults] = useState([]);
  const query = useQuery().get("query");

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return;

      const { data, error } = await supabase
        .from("recipes")
        .select("recipe_id, title, description, image_url")
        .ilike("title", `%${query}%`);

      if (error) {
        console.error("Error fetching recipes:", error);
        return;
      }

      setResults(data);
    };

    fetchData();
  }, [query]);

  const getFullImageUrl = (imagePath) => {
    return imagePath
      ? `${BASE_URL}/${recipeBucketPath}/${imagePath}`
      : foodplaceholder;
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f] px-4 py-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <Link
            to="/search"
            className="text-neutral-500 hover:text-white text-sm transition-colors"
          >
            ← Search
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-1 tracking-tight">
          {query ? `Results for "${query}"` : "Search Results"}
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          {results.length > 0
            ? `${results.length} recipe${results.length !== 1 ? "s" : ""} found`
            : ""}
        </p>

        {results.length > 0 ? (
          <div className="flex flex-col gap-3">
            {results.map((recipe) => (
              <Link
                to={`/recipes/${recipe.recipe_id}`}
                key={recipe.recipe_id}
                className="flex gap-4 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 hover:border-white/25 transition-colors"
              >
                <img
                  src={getFullImageUrl(recipe.image_url)}
                  alt={recipe.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="text-sm font-medium text-white">
                    {recipe.title}
                  </h3>
                  {recipe.description && (
                    <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : query ? (
          <p className="text-neutral-500 text-sm">
            No results found for &ldquo;{query}&rdquo;
          </p>
        ) : null}
      </div>
    </Layout>
  );
};

export default SearchResultsPage;
