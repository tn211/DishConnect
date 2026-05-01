import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";

const RatingButtons = ({
  recipeId,
  session,
  showAverage = true,
  onAverageRatingChange,
}) => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState("Not yet rated");
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);

  const updateAverageRating = useCallback(
    (ratings) => {
      if (ratings.length === 0) {
        setAverageRating("No ratings yet");
        onAverageRatingChange?.("No ratings yet");
        return;
      }
      const total = ratings.reduce((sum, record) => sum + record.rating, 0);
      const average = (total / ratings.length).toFixed(1);
      setAverageRating(average);
      onAverageRatingChange?.(average);
    },
    [onAverageRatingChange],
  );

  const updateUserRating = useCallback(
    (data) => {
      if (!session?.user) {
        setUserRating(null);
        return;
      }

      const ratingFromUser = data.find((r) => r.profile_id === session.user.id);
      setUserRating(ratingFromUser ? ratingFromUser.rating : null);
    },
    [session],
  );

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
  }, [recipeId, updateAverageRating, updateUserRating]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

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

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-neutral-400 text-sm font-medium">
        Rate this recipe:
      </span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const activeRating = hoverRating ?? userRating ?? 0;
          const isFilled = value <= activeRating;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(null)}
              aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
              className={`bg-transparent border-0 p-0 text-2xl leading-none transition-colors ${
                isFilled
                  ? "text-fuchsia-400 hover:text-fuchsia-300"
                  : "text-neutral-600 hover:text-fuchsia-400"
              }`}
            >
              {isFilled ? "★" : "☆"}
            </button>
          );
        })}
      </div>
      {showAverage && (
        <span className="text-neutral-500 text-sm">
          Average rating: <span className="text-white">{averageRating}</span>
        </span>
      )}
    </div>
  );
};

export default RatingButtons;
