import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase, BASE_URL, recipeBucketPath } from "../../supabaseClient";
import Layout from "../../components/layout-components/Layout";
import foodplaceholder from "../../assets/placeholder.png";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const query = useQuery().get("query");
  const navigate = useNavigate();

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

  const handleKeyPress = (event) => {
    if (event.key === "Enter") navigate(`/search-results?query=${searchTerm}`);
  };

  const getFullImageUrl = (imagePath) =>
    imagePath
      ? `${BASE_URL}/${recipeBucketPath}/${imagePath}`
      : foodplaceholder;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f]">
        <div className="max-w-2xl mx-auto px-4 pt-20 pb-16">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-semibold text-white mb-2 tracking-tight">
              Search Recipes
            </h1>
            <p className="text-neutral-500 text-sm">
              Find something delicious to cook
            </p>
          </div>
          <div className="flex gap-2 mb-10">
            <input
              type="text"
              placeholder="Search recipes…"
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              defaultValue={query}
              className="flex-1 h-11 px-4 rounded-xl border border-white/15 bg-[#1a1a1a] text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/60 transition-colors"
            />
            <button
              onClick={() => navigate(`/search-results?query=${searchTerm}`)}
              className="px-5 h-11 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-xl transition-colors border-0"
            >
              Search
            </button>
          </div>

          {results.length > 0 && (
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
                    <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {query && results.length === 0 && (
            <p className="text-neutral-500 text-sm text-center">
              No results found for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
