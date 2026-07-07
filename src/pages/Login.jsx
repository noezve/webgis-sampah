import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return alert("Email dan password wajib diisi!");
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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
      </div>
    </div>
  );
}