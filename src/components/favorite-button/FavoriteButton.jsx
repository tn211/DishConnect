import React from "react";
import { supabase } from "../../supabaseClient";

const FavoriteButton = ({ recipeId, isFavorite, setIsFavorite, session }) => {
  const toggleFavorite = async () => {
    if (!session || !session.user) {
      alert("You must be logged in to use favorites.");
      return;
    }

    const { error } = isFavorite
      ? await supabase
          .from("likes")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("profile_id", session.user.id)
      : await supabase
          .from("likes")
          .insert([{ recipe_id: recipeId, profile_id: session.user.id }]);

    if (error) {
      console.error("Error updating favorites:", error);
    } else {
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
        isFavorite
          ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
          : "bg-transparent border-white/15 text-neutral-400 hover:text-white hover:border-white/30"
      }`}
    >
      {isFavorite ? "♥ Saved" : "♡ Save"}
    </button>
  );
};

export default FavoriteButton;
