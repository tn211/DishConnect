import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, BASE_URL, avatarBucketPath } from "../../supabaseClient";
import Layout from "../../components/layout-components/Layout";
import profileplaceholder from "../../assets/profile-placeholder.png";

// define component to display followed users
const FollowingPage = ({ session }) => {
  // state for storing profiles and loading status
  const [followingProfiles, setFollowingProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // effect to fetch followed profiles on component mount or session change
  useEffect(() => {
    const fetchFollowingProfiles = async () => {
      // check if session exists and is valid
      if (!session || !session.user) {
        console.log("Session or session.user is not available");
        setLoading(false);
        return;
      }

      // fetch ids of followed users
      const profileId = session.user.id;
      const { data: followsData, error: followsError } = await supabase
        .from("follows")
        .select("follow_target_id")
        .eq("follower_id", profileId);

      // handle possible errors during fetching
      if (followsError) {
        console.error("Error fetching following data:", followsError);
        setLoading(false);
        return;
      }

      // check if user follows anyone
      if (followsData.length === 0) {
        setLoading(false);
        return;
      }

      // extract ids of followed profiles
      const followTargetIds = followsData.map(
        (follow) => follow.follow_target_id,
      );

      // fetch full profile details of followed users
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", followTargetIds);

      // handle possible errors during profile fetching
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setLoading(false);
        return;
      }

      // update state with fetched profiles and set loading to false
      setFollowingProfiles(profilesData);
      setLoading(false);
    };

    fetchFollowingProfiles();
  }, [session]);

  // function to construct full image URL
  const getFullImageUrl = (imagePath) => {
    // const baseUrl =
    //   "https://nwooccvnjqofbuqftrep.supabase.co/storage/v1/object/public/avatars";
    // return imagePath ? `${baseUrl}/${imagePath}` : profileplaceholder;
    // const imgBucket = "/storage/v1/object/public/avatars"
    return imagePath
      ? `${BASE_URL}/${avatarBucketPath}/${imagePath}`
      : profileplaceholder;
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f] px-4 py-10 max-w-5xl mx-auto">
        <h1 className="pixel-ui text-3xl font-semibold text-white mb-1 tracking-tight">
          Following
        </h1>
        <p className="text-neutral-500 text-sm mb-8">Chefs you follow.</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : followingProfiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {followingProfiles.map((profile) => (
              <Link
                to={`/chefs/${profile.id}`}
                key={profile.id}
                className="group bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-all flex flex-col items-center p-5 gap-3"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10">
                  <img
                    src={getFullImageUrl(profile.avatar_url)}
                    alt={`${profile.username}'s profile`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-white text-sm font-medium truncate w-full text-center">
                  {profile.username}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">
            You are not following anyone yet.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default FollowingPage;
