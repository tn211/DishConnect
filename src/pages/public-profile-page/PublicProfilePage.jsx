import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase, BASE_URL, avatarBucketPath } from "../../supabaseClient";
import Layout from "../../components/layout-components/Layout";
import RecipesList from "../../components/recipe-list/RecipeList";
import profileplaceholder from "../../assets/profile-placeholder.png";

const PublicProfilePage = ({ session }) => {
  const { id } = useParams(); // This is the profile_id from the URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  const getLastOnlineText = (lastSeenAt) => {
    if (!lastSeenAt) return "Last online unknown";

    const diffInMinutes = Math.floor(
      (Date.now() - new Date(lastSeenAt).getTime()) / 60000,
    );

    if (diffInMinutes < 5) return "Online recently";
    if (diffInMinutes < 60) return `Last online ${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Last online ${diffInHours} ${
        diffInHours === 1 ? "hour" : "hours"
      } ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Last online yesterday";
    return `Last online ${diffInDays} days ago`;
  };

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);

    let { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("username, avatar_url, last_seen_at")
      .eq("id", id)
      .single();

    if (userError) {
      const fallbackResponse = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", id)
        .single();

      userData = fallbackResponse.data;
      userError = fallbackResponse.error;
    }

    if (userError) {
      console.error("Error fetching user data:", userError);
      setUser(null);
      setAvatarUrl("");
      setLoading(false);
      return;
    }

    setUser(userData);
    setAvatarUrl(userData?.avatar_url || ""); // Set the avatar URL
    setLoading(false);
  }, [id]);

  const checkFollowing = useCallback(async () => {
    if (session && session.user) {
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", session.user.id)
        .eq("follow_target_id", id);

      if (error) {
        console.error("Error checking follow status:", error);
      } else {
        setIsFollowing(data.length > 0);
      }
    }
  }, [id, session]);

  useEffect(() => {
    fetchUserProfile();
    checkFollowing();
  }, [fetchUserProfile, checkFollowing]);

  const toggleFollow = async () => {
    if (!session || !session.user) {
      alert("You must be logged in to follow users.");
      return;
    }

    const { error } = isFollowing
      ? await supabase
          .from("follows")
          .delete()
          .eq("follower_id", session.user.id)
          .eq("follow_target_id", id)
      : await supabase
          .from("follows")
          .insert([{ follower_id: session.user.id, follow_target_id: id }]);

    if (error) {
      console.error("Error updating follow status:", error);
    } else {
      setIsFollowing(!isFollowing);
    }
  };

  const getFullImageUrl = (imagePath) => {
    // const baseUrl =
    //   "https://nwooccvnjqofbuqftrep.supabase.co/storage/v1/object/public/avatars";
    // return `${baseUrl}/${imagePath}`;
    return `${BASE_URL}/${avatarBucketPath}/${imagePath}`;
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f] px-4 py-10 max-w-5xl mx-auto">
        {loading && !user ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : user ? (
          <>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <img
                    src={
                      avatarUrl
                        ? getFullImageUrl(avatarUrl)
                        : profileplaceholder
                    }
                    alt={`${user.username}'s profile`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white tracking-tight">
                    {user.username}
                  </h1>
                  <p className="text-neutral-500 text-sm mt-1">
                    {getLastOnlineText(user.last_seen_at)}
                  </p>
                  <button
                    onClick={toggleFollow}
                    className={`mt-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      isFollowing
                        ? "border-white/20 text-neutral-400 hover:text-red-400 hover:border-red-400/30 bg-transparent"
                        : "bg-fuchsia-500 hover:bg-fuchsia-400 text-white border-transparent"
                    }`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                </div>
              </div>

              <h2 className="text-lg font-medium text-white mb-4">Recipes</h2>
              {!loading ? (
                <RecipesList supabase={supabase} userId={id} />
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
          </>
        ) : (
          <p className="text-neutral-500 text-sm">Profile could not be loaded.</p>
        )}
      </div>
    </Layout>
  );
};

export default PublicProfilePage;
