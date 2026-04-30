import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import Account from "./pages/account-page/Account";
import RecipeEntryPage from "./pages/recipe-entry-page/RecipeEntryPage";
import UserRecipesPage from "./pages/my-recipes-page/UserRecipesPage";
import RecipeDetail from "./pages/recipe-detail-page/RecipeDetail";
import AboutUs from "./pages/about-us-page/AboutUs";
import RecentRecipesPage from "./pages/community-page/RecentRecipesPage";
import SearchPage from "./pages/search-page/SearchPage";
import UserFavouritesPage from "./pages/favorites-page/UserFavourites";
import PublicProfilePage from "./pages/public-profile-page/PublicProfilePage";
import FollowingPage from "./pages/following-page/FollowingPage";
import SearchResultsPage from "./pages/search-page/SearchResultsPage";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <div>
      {!session ? (
        <Auth />
      ) : (
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <SearchPage
                  key={session.user.id}
                  session={session}
                  supabase={supabase}
                />
              }
            />
            <Route
              path="/my-recipes"
              element={
                <UserRecipesPage
                  key={session.user.id}
                  session={session}
                  supabase={supabase}
                />
              }
            />
            <Route
              path="/favourites"
              element={
                <UserFavouritesPage
                  key={session.user.id}
                  session={session}
                  supabase={supabase}
                />
              }
            />
            <Route
              path="/recipes/:recipeId"
              element={
                <RecipeDetail
                  key={session.user.id}
                  session={session}
                  supabase={supabase}
                />
              }
            />
            <Route
              path="/chefs/:id"
              element={
                <PublicProfilePage
                  key={session.user.id}
                  session={session}
                  supabase={supabase}
                />
              }
            />
            <Route
              path="/recent-recipes"
              element={
                <RecentRecipesPage
                  key={session.user.id}
                  session={session}
                  supabase={supabase}
                />
              }
            />
            <Route
              path="/add-recipe"
              element={
                <RecipeEntryPage
                  key={session.user.id}
                  session={session}
                  supabase={supabase}
                />
              }
            />
            <Route
              path="/search"
              element={
                <SearchPage
                  key={session.user.id}
                  session={session}
                  supabase={supabase}
                />
              }
            />
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route
              path="/following"
              element={
                <FollowingPage
                  key={session.user.id}
                  session={session}
                  supabase={supabase}
                />
              }
            />
            <Route
              path="/account"
              element={<Account key={session.user.id} session={session} />}
            />
            <Route
              path="/about-us"
              element={<AboutUs key={session.user.id} session={session} />}
            />
          </Routes>
        </Router>
      )}
    </div>
  );
}

export default App;
