import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";

const RatingButtons = ({ recipeId, session }) => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState("Not yet rated");
  const [userRating, setUserRating] = useState(null);

  const fetchRatings = useCallback(async () => {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("recipe_id", recipeId);

    if (error) {
      console.error("Error fetching ratings:", error);
      return;
    }

    setRatings(data);
    updateAverageRating(data);
    updateUserRating(data);
  }, [recipeId, session]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const updateUserRating = (data) => {
    const ratingFromUser = data.find((r) => r.profile_id === session.user.id);
    setUserRating(ratingFromUser ? ratingFromUser.rating : null);
  };

  const handleRating = async (rating) => {
    if (!session || !session.user) {
      alert("You must be logged in to rate recipes.");
      return;
    }

    const existingRating = ratings.find(
      (r) => r.profile_id === session.user.id,
    );
    let error;
    if (existingRating) {
      ({ error } = await supabase
        .from("ratings")
        .update({ rating })
        .match({ recipe_id: recipeId, profile_id: session.user.id }));
    } else {
      ({ error } = await supabase
        .from("ratings")
        .insert([
          { recipe_id: recipeId, profile_id: session.user.id, rating },
        ]));
    }

    if (error) {
      console.error("Error updating rating:", error);
      return;
    }

    fetchRatings();
  };

  const updateAverageRating = (ratings) => {
    if (ratings.length === 0) {
      setAverageRating("No ratings yet");
      return;
    }
    const total = ratings.reduce((sum, record) => sum + record.rating, 0);
    setAverageRating((total / ratings.length).toFixed(1));
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRating(value)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors border ${
              userRating === value
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-transparent border-white/15 text-neutral-400 hover:border-orange-500/50 hover:text-orange-400"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <span className="text-neutral-500 text-sm">
        Avg: <span className="text-white">{averageRating}</span>
      </span>
    </div>
  );
};

export default RatingButtons;
