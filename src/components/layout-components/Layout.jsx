import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiUserCircle } from "react-icons/hi2";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { supabase } from "../../supabaseClient";
import minilogo from "../../assets/minilogo.png";

const navLinks = [
  { to: "/search", label: "Search" },
  { to: "/recent-recipes", label: "Community" },
  { to: "/my-recipes", label: "My Recipes" },
  { to: "/favourites", label: "Favourites" },
  { to: "/following", label: "Following" },
  { to: "/about-us", label: "About Us" },
  { to: "/add-recipe", label: "Upload" },
];

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchAvatar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
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
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={minilogo} alt="DishConnect" className="h-8 w-auto" />
            <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
              DishConnect
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? "text-white bg-white/10"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/account" className="text-neutral-400 hover:text-white transition-colors">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-white/20" />
              ) : (
                <HiUserCircle className="w-7 h-7" />
              )}
            </Link>
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
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? "text-white bg-white/10"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
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
