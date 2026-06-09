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

  const navigate = useNavigate();

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      return alert(error.message);
    }

    const { error: pError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        nama: form.nama,
        role: form.role,
      });

    if (pError) {
      return alert("Gagal simpan profil");
    }

    alert("Berhasil! Silakan login.");
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
        <option value="transporter">Transporter</option>
        <option value="admin">Admin</option>
      </select>

      <button
        onClick={handleRegister}
        style={{
          width: "100%",
          padding: 10,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Daftar
      </button>
    </div>
  );
}