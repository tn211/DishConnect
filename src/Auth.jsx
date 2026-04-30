import { useState } from "react";
import { supabase } from "./supabaseClient";
import minilogo from "./assets/minilogo.png";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert(error.error_description || error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={minilogo} alt="DishConnect" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            DishConnect
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-3xl mb-3">✉️</div>
              <p className="text-white font-medium mb-1">Check your email</p>
              <p className="text-neutral-400 text-sm">
                We sent a magic link to{" "}
                <span className="text-white">{email}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-neutral-400 uppercase tracking-wider"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/60 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-orange-500/40 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
