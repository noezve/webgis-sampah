import { useState } from "react";
import { supabase } from "../lib/supabase";
<<<<<<< HEAD
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("warga");
=======
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "warga",
  });
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

<<<<<<< HEAD
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
=======
  const handleRegister = async () => {
    if (!form.nama || !form.email || !form.password) {
      alert("Semua field wajib diisi.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67
    });

    if (error) {
      setLoading(false);
      return alert(error.message);
    }

<<<<<<< HEAD
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
      return alert("Gagal simpan profil");
    }

    alert("Pendaftaran berhasil!");
=======
    const userId = data?.user?.id;

    if (userId) {
      const { error: pError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          nama: form.nama,
          role: form.role,
        },
        { onConflict: "id" }
      );

      if (pError) {
        setLoading(false);
        return alert(`Akun dibuat, tetapi gagal menyimpan profil role: ${pError.message}`);
      }
    }

    setLoading(false);

    alert(
      data?.user
        ? "Akun berhasil dibuat. Silakan login untuk masuk."
        : "Pendaftaran berhasil. Silakan cek email untuk verifikasi sebelum login."
    );
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67
    navigate("/login");
  };

  return (
<<<<<<< HEAD
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
=======
    <div
      style={{
        padding: 20,
        maxWidth: 400,
        margin: "auto",
      }}
    >
      <h2>Daftar Akun</h2>

      <input
        placeholder="Nama"
        onChange={(e) =>
          setForm({
            ...form,
            nama: e.target.value,
          })
        }
        style={{
          width: "100%",
          marginBottom: 10,
        }}
      />

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
        style={{
          width: "100%",
          marginBottom: 10,
        }}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value,
          })
        }
        style={{
          width: "100%",
          marginBottom: 10,
        }}
      />

      <select
        onChange={(e) =>
          setForm({
            ...form,
            role: e.target.value,
          })
        }
        style={{
          width: "100%",
          marginBottom: 10,
        }}
      >
        <option value="warga">Warga</option>
        <option value="courier">Courier</option>
        <option value="admin">Admin</option>
      </select>

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          background: loading ? "#64748b" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Mendaftarkan..." : "Daftar"}
      </button>
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67
    </div>
  );
}