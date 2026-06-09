import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Map from "../components/Map";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: "30px",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  header: {
    background: "#0f172a",
    color: "#fff",
    padding: "20px 25px",
    borderRadius: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },

  logoutBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.3fr",
    gap: "25px",
  },

  card: {
    background: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },

  title: {
    marginBottom: "15px",
    color: "#0f172a",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    marginBottom: "12px",
    boxSizing: "border-box",
  },

  btn: (color) => ({
    width: "100%",
    background: color,
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    marginBottom: "10px",
  }),

  historyCard: {
    background: "#f8fafc",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "10px",
    borderLeft: "4px solid #2563eb",
  },

  sectionTitle: {
    marginTop: "20px",
    marginBottom: "10px",
    color: "#0f172a",
  },
};

export default function Warga() {
  const [warga, setWarga] = useState(null);
  const [latlng, setLatLng] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    jenis: "",
    berat: "",
  });

  const [history, setHistory] = useState({
    sampah: [],
    bayar: [],
    angkut: [],
  });

  const refresh = async (id) => {
    const sampah = await supabase
      .from("sampah")
      .select("*")
      .eq("warga_id", id);

    const pembayaran = await supabase
      .from("pembayaran")
      .select("*")
      .eq("warga_id", id);

    const pengangkutan = await supabase
      .from("pengangkutan")
      .select(`
        *,
        transporter:profiles(nama)
      `)
      .eq("warga_id", id);

    setHistory({
      sampah: sampah.data || [],
      bayar: pembayaran.data || [],
      angkut: pengangkutan.data || [],
    });
  };

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("warga")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setWarga(data);

        setForm((prev) => ({
          ...prev,
          nama: data.nama || "",
          alamat: data.alamat || "",
        }));

        refresh(data.id);
      }
    };

    load();
  }, []);

  const saveProfile = async () => {
    if (!latlng) {
      alert("Silakan pilih lokasi pada peta.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      user_id: user.id,
      nama: form.nama,
      alamat: form.alamat,
      location: `POINT(${latlng.lng} ${latlng.lat})`,
    };

    let result;

    if (warga) {
      result = await supabase
        .from("warga")
        .update(payload)
        .eq("id", warga.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("warga")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      alert(result.error.message);
      return;
    }

    setWarga(result.data);
    refresh(result.data.id);

    alert("Profil berhasil disimpan.");
  };

  const addData = async (table, payload) => {
    if (!warga) {
      alert("Simpan profil terlebih dahulu.");
      return;
    }

    const { error } = await supabase
      .from(table)
      .insert({
        ...payload,
        warga_id: warga.id,
      });

    if (error) {
      alert(error.message);
      return;
    }

    refresh(warga.id);
    alert("Data berhasil disimpan.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>Dashboard Warga</h2>
            <small>Sistem Informasi Pengelolaan Sampah</small>
          </div>

          <button
            onClick={logout}
            style={styles.logoutBtn}
          >
            Logout
          </button>
        </div>

        <div style={styles.grid}>
          {/* KIRI */}
          <div style={styles.card}>
            <h3 style={styles.title}>
              Profil & Lokasi
            </h3>

            <input
              style={styles.input}
              placeholder="Nama Lengkap"
              value={form.nama}
              onChange={(e) =>
                setForm({
                  ...form,
                  nama: e.target.value,
                })
              }
            />

            <input
              style={styles.input}
              placeholder="Alamat"
              value={form.alamat}
              onChange={(e) =>
                setForm({
                  ...form,
                  alamat: e.target.value,
                })
              }
            />

            <div
              style={{
                marginBottom: 15,
              }}
            >
              <Map
                data={warga ? [warga] : []}
                setLatLng={setLatLng}
                selectedMarker={latlng}
              />
            </div>

            <button
              onClick={saveProfile}
              style={styles.btn("#2563eb")}
            >
              Simpan Profil & Lokasi
            </button>

            <h3 style={styles.sectionTitle}>
              Data Sampah
            </h3>

            <input
              style={styles.input}
              placeholder="Jenis Sampah"
              value={form.jenis}
              onChange={(e) =>
                setForm({
                  ...form,
                  jenis: e.target.value,
                })
              }
            />

            <input
              type="number"
              style={styles.input}
              placeholder="Berat (Kg)"
              value={form.berat}
              onChange={(e) =>
                setForm({
                  ...form,
                  berat: e.target.value,
                })
              }
            />

            <button
              onClick={() =>
                addData("sampah", {
                  jenis: form.jenis,
                  berat: form.berat,
                })
              }
              style={styles.btn("#16a34a")}
            >
              Kirim Data Sampah
            </button>

            <button
              onClick={() =>
                addData("pengangkutan", {
                  status: "Menunggu",
                })
              }
              style={styles.btn("#eab308")}
            >
              Request Pengangkutan
            </button>

            <button
              onClick={() =>
                addData("pembayaran", {
                  status: "sudah",
                  tanggal: new Date(),
                })
              }
              style={styles.btn("#2563eb")}
            >
              Bayar Iuran
            </button>
          </div>

          {/* KANAN */}
          <div style={styles.card}>
            <h3 style={styles.title}>
              Riwayat Pengangkutan
            </h3>

            {history.angkut.length === 0 ? (
              <p>Belum ada data.</p>
            ) : (
              history.angkut.map((item) => (
                <div
                  key={item.id}
                  style={styles.historyCard}
                >
                  <b>Status:</b> {item.status}
                  <br />
                  <b>Petugas:</b>{" "}
                  {item.transporter?.nama ||
                    "Menunggu Petugas"}
                </div>
              ))
            )}

            <h3 style={styles.sectionTitle}>
              Riwayat Pembayaran
            </h3>

            {history.bayar.length === 0 ? (
              <p>Belum ada data.</p>
            ) : (
              history.bayar.map((item) => (
                <div
                  key={item.id}
                  style={styles.historyCard}
                >
                  <b>Tanggal:</b>{" "}
                  {item.tanggal
                    ? new Date(
                        item.tanggal
                      ).toLocaleDateString()
                    : "-"}
                  <br />
                  <b>Status:</b> {item.status}
                </div>
              ))
            )}

            <h3 style={styles.sectionTitle}>
              Riwayat Sampah
            </h3>

            {history.sampah.length === 0 ? (
              <p>Belum ada data.</p>
            ) : (
              history.sampah.map((item) => (
                <div
                  key={item.id}
                  style={styles.historyCard}
                >
                  <b>Jenis:</b> {item.jenis}
                  <br />
                  <b>Berat:</b> {item.berat} Kg
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}