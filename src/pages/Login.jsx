import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return alert("Email dan password wajib diisi!");
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
=======

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67
      email,
      password,
    });

<<<<<<< HEAD
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Masuk ke Akun</h2>
          <p>Silakan masuk untuk mengelola data sampah</p>
        </div>

        <form onSubmit={login}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Alamat Email</label>
            <input
              id="email-input"
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Kata Sandi</label>
            <input
              id="password-input"
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block mt-4" 
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Belum punya akun?{" "}
            <Link to="/register">Daftar di sini</Link>
          </p>
        </div>
=======
    if (error) {
      alert(error.message);
      return;
    }

    if (data?.user?.id) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
      }

      if (profileData?.role) {
        window.location.href = "/";
        return;
      }
    }

    window.location.href = "/";
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login WebGIS Sampah</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>

        <p>
          Belum punya akun?
          <Link to="/register"> Daftar</Link>
        </p>
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67
      </div>
    </div>
  );
}