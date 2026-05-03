import "./App.css";
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const updateLastSeen = async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", session.user.id);

      if (error) console.error("Error updating last seen:", error);
    };

    updateLastSeen();
  }, [session]);

  const requireAuth = (element) => {
    return session ? element : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<SearchPage session={session} supabase={supabase} />}
        />
        <Route
          path="/search"
          element={<SearchPage session={session} supabase={supabase} />}
        />
        <Route
          path="/search-results"
          element={<SearchResultsPage session={session} supabase={supabase} />}
        />
        <Route
          path="/recipes/:recipeId"
          element={<RecipeDetail session={session} supabase={supabase} />}
        />
        <Route
          path="/chefs/:id"
          element={<PublicProfilePage session={session} supabase={supabase} />}
        />
        <Route
          path="/recent-recipes"
          element={<RecentRecipesPage session={session} supabase={supabase} />}
        />
        <Route
          path="/about-us"
          element={<AboutUs session={session} supabase={supabase} />}
        />
        <Route path="/login" element={<Auth />} />
        <Route
          path="/my-recipes"
          element={requireAuth(
            <UserRecipesPage session={session} supabase={supabase} />,
          )}
        />
        <Route
          path="/favourites"
          element={requireAuth(
            <UserFavouritesPage session={session} supabase={supabase} />,
          )}
        />
        <Route
          path="/add-recipe"
          element={requireAuth(
            <RecipeEntryPage session={session} supabase={supabase} />,
          )}
        />
        <Route
          path="/following"
          element={requireAuth(
            <FollowingPage session={session} supabase={supabase} />,
          )}
        />
        <Route
          path="/account"
          element={requireAuth(<Account session={session} />)}
        />
      </Routes>
    </Router>
  );
}

export default App;
