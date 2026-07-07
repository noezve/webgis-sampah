import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Admin from "./pages/Admin";
import Courier from "./pages/Courier";
import Warga from "./pages/Warga";
import Login from "./pages/Login";

function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return setRole("guest");

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      setRole(data?.role);
    };

    getUser();
  }, []);

  if (role === null) return <h2>Loading...</h2>;
  if (role === "guest") return <Login />;
  if (role === "admin") return <Admin />;
  if (role === "transporter") return <Courier />;
  return <Warga />;
}

export default App;
