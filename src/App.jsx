import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Admin from "./pages/Admin";
import Transporter from "./pages/Transporter";
import Warga from "./pages/Warga";
import Login from "./pages/Login";

function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole("guest");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        setRole("guest");
        return;
      }

      setRole(data?.role);
    };

    getUser();
  }, []);

  if (role === null) {
    return <h2>Loading...</h2>;
  }

  if (role === "guest") {
    return <Login />;
  }

  if (role === "admin") {
    return <Admin />;
  }

  if (role === "transporter") {
    return <Transporter />;
  }

  return <Warga />;
}

export default App;