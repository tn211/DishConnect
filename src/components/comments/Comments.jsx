import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { HiUserCircle } from "react-icons/hi2";

const CommentAvatar = ({ avatarPath }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!avatarPath) return;
    supabase.storage
      .from("avatars")
      .download(avatarPath)
      .then(({ data }) => {
        if (data) setUrl(URL.createObjectURL(data));
      });
  }, [avatarPath]);

  return url ? (
    <img src={url} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0" />
  ) : (
    <HiUserCircle className="w-8 h-8 text-neutral-600 shrink-0" />
  );
};

const Comments = ({ recipeId, session }) => {
  const [comments, setComments] = useState([]);
  const [newCommentBody, setNewCommentBody] = useState("");

  const fetchComments = useCallback(async () => {
    const { data: commentsData, error } = await supabase
      .from("comments")
      .select(
        `
                *,
                user_id!inner(id, username, avatar_url)
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
              className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex gap-3"
            >
              <Link to={`/chefs/${comment.user_id.id}`}>
                <CommentAvatar avatarPath={comment.user_id.avatar_url} />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Link
                    to={`/chefs/${comment.user_id.id}`}
                    className="text-fuchsia-400 text-sm font-medium hover:text-fuchsia-300 transition-colors"
                  >
                    {comment.user_id.username}
                  </Link>
                  <span className="text-neutral-600 text-xs shrink-0 ml-2">
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
              </div>
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
          className="w-full bg-[#1a1a1a] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-fuchsia-500/60 transition-colors resize-none h-20"
        />
        <button
          type="submit"
          className="self-end px-5 py-2 bg-fuchsia-500 hover:bg-fuchsia-400 text-white text-sm font-medium rounded-lg transition-colors border-0"
        >
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default Comments;
