import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "warga",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
    });

    if (error) {
      setLoading(false);
      return alert(error.message);
    }

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
    navigate("/login");
  };

  return (
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
    </div>
  );
}