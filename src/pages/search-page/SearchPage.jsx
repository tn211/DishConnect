import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { supabase, BASE_URL, recipeBucketPath } from "../../supabaseClient";
import Layout from "../../components/layout-components/Layout";
import foodplaceholder from "../../assets/placeholder.png";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [heroRecipes, setHeroRecipes] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
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

  useEffect(() => {
    const fetchHeroRecipes = async () => {
      const featuredRecipeIds = [55, 51, 59, 22, 60, 57];

      const { data, error } = await supabase
        .from("recipes")
        .select("recipe_id, title, description, image_url")
        .in("recipe_id", featuredRecipeIds);

      if (error) {
        console.error("Error fetching hero recipes:", error);
        return;
      }

      const orderedRecipes = featuredRecipeIds
        .map((id) => data.find((recipe) => recipe.recipe_id === id))
        .filter(Boolean);

      setHeroRecipes(orderedRecipes);
    };

    fetchHeroRecipes();
  }, []);

  useEffect(() => {
    if (heroRecipes.length < 2) return;

    const intervalId = setInterval(() => {
      setActiveHeroIndex((currentIndex) =>
        currentIndex === heroRecipes.length - 1 ? 0 : currentIndex + 1,
      );
    }, 3500);

    return () => clearInterval(intervalId);
  }, [heroRecipes.length]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") navigate(`/search-results?query=${searchTerm}`);
  };

  const handleSearch = () => {
    navigate(`/search-results?query=${searchTerm}`);
  };

  const showPreviousHeroRecipe = (event) => {
    event.preventDefault();
    setActiveHeroIndex((currentIndex) =>
      currentIndex === 0 ? heroRecipes.length - 1 : currentIndex - 1,
    );
  };

  const showNextHeroRecipe = (event) => {
    event.preventDefault();
    setActiveHeroIndex((currentIndex) =>
      currentIndex === heroRecipes.length - 1 ? 0 : currentIndex + 1,
    );
  };

  const popularSearches = ["Chicken", "Soup", "Pasta", "Vegetarian"];

  const getFullImageUrl = (imagePath) =>
    imagePath
      ? `${BASE_URL}/${recipeBucketPath}/${imagePath}`
      : foodplaceholder;

  const getShortDescription = (description) => {
    if (!description) return "Search by ingredient, craving, or cuisine.";
    return description.length > 95
      ? `${description.slice(0, 95).trim()}…`
      : description;
  };

  const activeHeroRecipe = heroRecipes[activeHeroIndex];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-14 lg:pt-12 lg:pb-20">
          <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-300 mb-6">
                Discover. Cook. Share.
              </div>
              <h1 className="pixel-ui max-w-[560px] text-[2.45rem] sm:text-[3rem] lg:text-[3.35rem] text-white tracking-normal leading-[1.18] mb-5">
                Find your next favourite recipe.
              </h1>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-xl mb-8">
                Browse community recipes, save dishes you love, and share your
                own kitchen wins with DishConnect.
              </p>

              <div className="bg-[#171717] border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/30 max-w-2xl">
                <div className="flex flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search chicken, soup, pasta…"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    defaultValue={query}
                    className="min-w-0 flex-1 h-12 px-4 rounded-xl border border-white/10 bg-[#0f0f0f] text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-fuchsia-500/60 transition-colors"
                  />
                  <button
                    onClick={handleSearch}
                    className="shrink-0 px-6 h-12 bg-fuchsia-500 hover:bg-fuchsia-400 text-white text-sm font-medium rounded-xl transition-colors border-0"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-5">
                <span className="text-neutral-600 text-sm">Popular:</span>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => navigate(`/search-results?query=${term}`)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 mt-9 text-sm">
                <div>
                  <p className="pixel-ui text-2xl font-semibold text-white">
                    Millions
                  </p>
                   <p className="text-neutral-500">of Community recipes</p>
                </div>
                <div>
                  <p className="pixel-ui text-2xl font-semibold text-white">
                    Global
                  </p>
                  <p className="text-neutral-500">Home-cooked flavours</p>
                </div>
                <div>
                  <p className="pixel-ui text-2xl font-semibold text-white">
                    Free
                  </p>
                  <p className="text-neutral-500">to Browse and discover</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-10 bg-fuchsia-500/10 blur-3xl rounded-full" />
              <Link
                to={
                  activeHeroRecipe
                    ? `/recipes/${activeHeroRecipe.recipe_id}`
                    : "/recent-recipes"
                }
                className="relative block bg-[#171717] border border-white/10 rounded-[2rem] p-4 rotate-2 shadow-2xl shadow-black/40 overflow-hidden hover:rotate-1 transition-transform"
              >
                <img
                  src={getFullImageUrl(activeHeroRecipe?.image_url)}
                  alt={activeHeroRecipe?.title || "Featured recipe"}
                  className="h-[430px] w-full object-cover rounded-[1.5rem]"
                />
                {heroRecipes.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousHeroRecipe}
                      className="absolute left-7 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/40 hover:bg-black/65 border border-white/15 text-white backdrop-blur-md flex items-center justify-center transition-colors"
                      aria-label="Previous featured recipe"
                    >
                      <HiChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextHeroRecipe}
                      className="absolute right-7 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/40 hover:bg-black/65 border border-white/15 text-white backdrop-blur-md flex items-center justify-center transition-colors"
                      aria-label="Next featured recipe"
                    >
                      <HiChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                <div className="absolute left-8 right-8 bottom-8 bg-black/65 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                  <p className="text-white font-medium mb-1">
                    {activeHeroRecipe?.title || "Tonight's inspiration"}
                  </p>
                  <p className="text-neutral-400 text-sm line-clamp-2">
                    {getShortDescription(activeHeroRecipe?.description)}
                  </p>
                  {heroRecipes.length > 1 && (
                    <div className="flex gap-1.5 mt-3">
                      {heroRecipes.map((recipe, index) => (
                        <button
                          key={recipe.recipe_id}
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            setActiveHeroIndex(index);
                          }}
                          className={`h-1.5 rounded-full transition-all ${
                            index === activeHeroIndex
                              ? "w-6 bg-fuchsia-400"
                              : "w-1.5 bg-white/30 hover:bg-white/60"
                          }`}
                          aria-label={`Show ${recipe.title}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </section>

          {query && (
            <div className="max-w-2xl mt-14">
              <h2 className="text-white text-xl font-medium mb-4">
                Results for &ldquo;{query}&rdquo;
              </h2>
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
                        <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                          {recipe.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">
                  No results found for &ldquo;{query}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
