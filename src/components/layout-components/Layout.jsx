import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiUserCircle } from "react-icons/hi2";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { supabase } from "../../supabaseClient";
import minilogo from "../../assets/minilogo.png";

const privateNavLinks = [
  { to: "/search", label: "Search" },
  { to: "/recent-recipes", label: "Explore" },
  { to: "/favourites", label: "Favourites" },
  { to: "/following", label: "Following" },
  { to: "/about-us", label: "About Us" },
];

const publicNavLinks = [
  { to: "/search", label: "Search" },
  { to: "/recent-recipes", label: "Explore" },
  { to: "/about-us", label: "About Us" },
];

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [session, setSession] = useState(null);
  const location = useLocation();
  const navLinks = session ? privateNavLinks : publicNavLinks;

  useEffect(() => {
    const fetchAvatar = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (!session?.user) {
        setAvatarUrl(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", session.user.id)
        .single();
      if (profile?.avatar_url) {
        const { data } = await supabase.storage
          .from("avatars")
          .download(profile.avatar_url);
        if (data) setAvatarUrl(URL.createObjectURL(data));
      }
    };
    fetchAvatar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session?.user) setAvatarUrl(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/10">
        <div className="w-full px-5 sm:px-7 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={minilogo} alt="DishConnect" className="h-8 w-auto" />
            <span className="brand-wordmark text-white text-[14px] tracking-tight">
              DishConnect
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 ml-12">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`pixel-ui px-3 py-2 rounded-md text-[10px] font-medium transition-colors ${
                  location.pathname === to
                    ? "text-white bg-white/10"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {session ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/my-recipes"
                    className="pixel-ui text-neutral-400 hover:text-white text-[10px] font-medium px-3 py-2 rounded-lg transition-colors"
                  >
                    My Recipes
                  </Link>
                  <Link
                    to="/add-recipe"
                    className="pixel-ui bg-fuchsia-500 hover:bg-fuchsia-400 text-white text-[10px] font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Upload
                  </Link>
                </div>
                <Link
                  to="/account"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <HiUserCircle className="w-7 h-7" />
                  )}
                </Link>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="pixel-ui text-neutral-400 hover:text-white text-[10px] font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/login"
                  className="pixel-ui bg-fuchsia-500 hover:bg-fuchsia-400 text-white text-[10px] font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white bg-transparent border-0 rounded-md"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <HiXMark className="w-6 h-6" />
              ) : (
                <HiBars3 className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0f0f0f]/95 backdrop-blur-md px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`pixel-ui px-3 py-2 rounded-md text-[10px] font-medium transition-colors ${
                  location.pathname === to
                    ? "text-white bg-white/10"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
            {!session && (
              <div className="mt-2 flex flex-col gap-1">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="pixel-ui text-neutral-400 hover:text-white text-[10px] font-medium px-3 py-2 rounded-md transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="pixel-ui bg-fuchsia-500 hover:bg-fuchsia-400 text-white text-[10px] font-medium px-3 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            {session && (
              <div className="mt-2 flex flex-col gap-1">
                <Link
                  to="/my-recipes"
                  onClick={() => setMenuOpen(false)}
                  className="pixel-ui text-neutral-400 hover:text-white text-[10px] font-medium px-3 py-2 rounded-md transition-colors"
                >
                  My Recipes
                </Link>
                <Link
                  to="/add-recipe"
                  onClick={() => setMenuOpen(false)}
                  className="pixel-ui bg-fuchsia-500 hover:bg-fuchsia-400 text-white text-[10px] font-medium px-3 py-2 rounded-md transition-colors"
                >
                  Upload
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t border-white/10 py-4 text-center text-xs text-neutral-500">
        DishConnect © 2026. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
