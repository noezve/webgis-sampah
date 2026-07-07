import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("warga");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    if (!nama || !email || !password) {
      return alert("Nama, email, dan password wajib diisi!");
    }

    setLoading(true);
    // signup auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setLoading(false);
      return alert(error.message);
    }

    // pastikan user ada
    if (!data.user) {
      setLoading(false);
      return alert("User tidak ditemukan setelah register");
    }

    // insert ke profiles
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        nama: nama,
        role: role,
      },
    ]);

    setLoading(false);
    if (insertError) {
      console.error(insertError);
      return alert("Gagal simpan profil: " + insertError.message);
    }

    alert("Pendaftaran berhasil! Silakan periksa email Anda (jika konfirmasi email aktif) atau silakan langsung login.");
    navigate("/login");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Daftar Akun Baru</h2>
          <p>Lengkapi formulir di bawah untuk mendaftar</p>
        </div>

        <form onSubmit={register}>
          <div className="form-group">
            <label className="form-label" htmlFor="nama-input">Nama Lengkap</label>
            <input
              id="nama-input"
              className="input-field"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

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
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role-select">Pilih Peran</label>
            <select
              id="role-select"
              className="select-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="warga">Warga</option>
              <option value="transporter">Courier</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block mt-4" 
            disabled={loading}
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Sudah memiliki akun?{" "}
            <Link to="/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}