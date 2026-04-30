import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";

const Comments = ({ recipeId, session }) => {
  const [comments, setComments] = useState([]);
  const [newCommentBody, setNewCommentBody] = useState("");

  const fetchComments = useCallback(async () => {
    const { data: commentsData, error } = await supabase
      .from("comments")
      .select(
        `
                *,
                user_id!inner(username)
            `,
      )
      .eq("slug", recipeId);

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    setComments(commentsData);
  }, [recipeId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentChange = (e) => {
    setNewCommentBody(e.target.value);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!session || !session.user) {
      alert("You must be logged in to post a comment.");
      return;
    }

    const { error } = await supabase.from("comments").insert([
      {
        slug: recipeId,
        body: newCommentBody,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error posting comment:", error);
      return;
    }

    setNewCommentBody("");
    fetchComments(); // Re-fetch comments to show the new comment immediately
  };

  return (
    <div className="border-t border-white/10 pt-6">
      <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-4">
        Comments
      </h3>

      {comments.length > 0 ? (
        <ul className="flex flex-col gap-4 mb-6">
          {comments.map((comment, index) => (
            <li
              key={index}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-400 text-sm font-medium">
                  {comment.user_id.username}
                </span>
                <span className="text-neutral-600 text-xs">
                  {new Date(comment.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-600 text-sm mb-6">
          No comments yet. Be the first!
        </p>
      )}

      <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
        <textarea
          value={newCommentBody}
          onChange={handleCommentChange}
          placeholder="Write a comment…"
          required
          className="w-full bg-[#1a1a1a] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/60 transition-colors resize-none h-20"
        />
        <button
          type="submit"
          className="self-end px-5 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors border-0"
        >
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default Comments;
