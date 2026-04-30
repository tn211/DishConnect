import { supabase } from "../../supabaseClient";

function LogoutButton() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
  };

  return <button onClick={handleLogout}>Log out</button>;
}

export default LogoutButton;
