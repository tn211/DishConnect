import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout-components/Layout";
import Avatar from "../../components/avatar/Avatar";

export default function Account({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [website, setWebsite] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      const { user } = session;

      let { data, error } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn(error);
      } else if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }

      setLoading(false);
    }

    getProfile();
  }, [session]);

  async function updateProfile(event, avatarUrl) {
    event.preventDefault();

    setLoading(true);
    const { user } = session;

    // check if the username is taken by someone else
    let { data: usernameData, error: usernameError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .not("id", "eq", user.id); // exclude the current user's profile from the check

    if (usernameError) {
      alert(usernameError.message);
      setLoading(false);
      return;
    }

    // if usernameData is not empty, the username is taken
    if (usernameData.length > 0) {
      alert("Username is taken. Please choose another one.");
      setLoading(false);
      return;
    }

    const updates = {
      id: user.id,
      username,
      website,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    let { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      alert(error.message);
    } else {
      setAvatarUrl(avatarUrl);
    }
    setLoading(false);
  }

  const inputCls =
    "w-full bg-[#0f0f0f] border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-fuchsia-500/60 transition-colors disabled:text-neutral-600";
  const labelCls =
    "block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5";

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f0f] px-4 py-10">
        <div className="max-w-md mx-auto">
          <h1 className="pixel-ui text-3xl font-semibold text-white mb-1 tracking-tight">
            Account
          </h1>
          <p className="text-neutral-500 text-sm mb-8">Manage your profile.</p>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex justify-center">
              <Avatar
                url={avatar_url}
                size={100}
                onUpload={(event, url) => updateProfile(event, url)}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelCls}>
                Email
              </label>
              <input
                id="email"
                type="text"
                value={session.user.email}
                disabled
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="username" className={labelCls}>
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username || ""}
                onChange={(e) => setUsername(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="website" className={labelCls}>
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website || ""}
                onChange={(e) => setWebsite(e.target.value)}
                className={inputCls}
                placeholder="https://…"
              />
            </div>

            <button
              type="submit"
              onClick={updateProfile}
              disabled={loading}
              className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 disabled:bg-fuchsia-500/40 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors border-0"
            >
              {loading ? "Saving…" : "Update Profile"}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 bg-transparent border border-white/15 text-neutral-400 hover:text-white hover:border-white/30 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="flex-1 bg-transparent border border-white/15 text-red-400 hover:text-red-300 hover:border-red-400/30 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
