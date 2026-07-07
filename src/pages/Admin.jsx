import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Map from "../components/Map";
import { readTransactions, getTransactionSummary } from "../lib/transactions";

const s = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: "30px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#16a34a",
    color: "#fff",
    padding: "18px 24px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,.1)",
    marginBottom: "20px",
  },

  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
  },

  tabContainer: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  tab: (active) => ({
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    transition: ".2s",
    background: active ? "#16a34a" : "#e2e8f0",
    color: active ? "#fff" : "#334155",
  }),

  btn: (color = "#16a34a") => ({
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: "600",
  }),

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    background: "#fff",
  },

  th: {
    background: "#16a34a",
    color: "#fff",
    padding: "12px",
    textAlign: "left",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },

  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    marginLeft: "10px",
  },

  label: {
    fontWeight: "600",
    color: "#334155",
  },

  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
  },
};

export default function Admin() {
  const [tab, setTab] = useState("peta");
  const [list, setList] = useState({ warga: [], bayar: [], angkut: [] });
  const [filter, setFilter] = useState("semua");
  const [transactionSummary, setTransactionSummary] = useState({
    warga: { count: 0, total: 0 },
    courier: { count: 0, total: 0 },
  });

  const fetchAll = useCallback(async () => {
    const { data: w } = await supabase.from("warga").select("*, pembayaran(status)");
    const { data: b } = await supabase.from("pembayaran").select("*, warga(nama)");
    const { data: a } = await supabase.from("pengangkutan").select("*, warga(nama), profiles(nama)");
    const transactions = readTransactions();
    
    setList({ 
      warga: w || [], 
      bayar: b || [], 
      angkut: a || [] 
    });
    setTransactionSummary(getTransactionSummary(transactions));
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchAll();
    };

    void load();
  }, [fetchAll]);

  const handleUpdate = async (table, id, status) => {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (!error) {
      alert("Status berhasil diperbarui!");
      fetchAll();
    }
  };

  const removeData = async (table, id) => {
    if (confirm("Hapus data ini?")) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (!error) {
        alert("Data berhasil dihapus!");
        fetchAll();
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Logika Filter Peta berdasarkan Status Pembayaran Warga
  const filteredWarga = list.warga.filter((w) => {
    if (filter === "semua") return true;
    const isSudah = w.pembayaran?.some((p) => p.status === "sudah");
    return filter === "sudah" ? isSudah : !isSudah;
  });

  return (
  <div style={s.page}>
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
  <h2 style={s.title}>♻ Dashboard Admin</h2>

  <button
    onClick={logout}
    style={s.btn("#dc2626")}
  >
    Logout
  </button>
</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 8px", color: "#16a34a" }}>Total Transaksi Warga</h3>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{transactionSummary.warga.count}</div>
          <div style={{ color: "#64748b" }}>Rp {transactionSummary.warga.total.toLocaleString("id-ID")}</div>
        </div>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 8px", color: "#16a34a" }}>Total Transaksi Courier</h3>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{transactionSummary.courier.count}</div>
          <div style={{ color: "#64748b" }}>Rp {transactionSummary.courier.total.toLocaleString("id-ID")}</div>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div style={s.tabContainer}>
        <button onClick={() => setTab("peta")} style={s.tab(tab === "peta")}>Peta Monitoring</button>
        <button onClick={() => setTab("warga")} style={s.tab(tab === "warga")}>Data Warga</button>
        <button onClick={() => setTab("pembayaran")} style={s.tab(tab === "pembayaran")}>Verifikasi Pembayaran</button>
        <button onClick={() => setTab("pengangkutan")} style={s.tab(tab === "pengangkutan")}>Log Pengangkutan</button>
      </div>

      {/* Konten Tab 1: Peta Monitoring */}
      {tab === "peta" && (
        <div>
          <div style={{ marginBottom: 20 }}>
  <label style={s.label}>
    Filter Pembayaran Warga
  </label>

  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    style={s.select}
  >
              <option value="semua">Semua</option>
              <option value="sudah">Sudah Bayar</option>
              <option value="belum">Belum Bayar</option>
            </select>
          </div>
          <div style={{ height: 350, marginBottom: 20 }}>
            <Map data={filteredWarga} />
          </div>
        </div>
      )}

      {/* Konten Tab 2: Data Warga */}
      {tab === "warga" && (
  <div style={s.card}>
    <div style={s.tableWrapper}>
      <table style={s.table}>
          <thead>
            <tr style={{ background: "#f4f4f5", textAlign: "left" }}>
              <th style={s.th}>Nama Warga</th>
              <th style={s.th}>Alamat</th>
              <th style={s.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.warga.map((w) => (
              <tr key={w.id}>
                <td style={s.t}>{w.nama}</td>
                <td style={s.td}>{w.alamat}</td>
                <td style={s.td}>
                  <button onClick={() => removeData("warga", w.id)} style={s.btn("#dc2626")}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
              </table>
    </div>
  </div>
)}

      {/* Konten Tab 3: Verifikasi Pembayaran */}
      {tab === "pembayaran" && (
        <table style={s.table}>
          <thead>
            <tr style={{ background: "#f4f4f5", textAlign: "left" }}>
              <th style={s.th}>Nama Warga</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.bayar.map((p) => (
              <tr key={p.id}>
                <td style={s.th}>{p.warga?.nama || "Tidak Diketahui"}</td>
                <td style={s.th}><b>{p.status}</b></td>
                <td style={s.th}>
                  {p.status !== "sudah" && (
                    <button onClick={() => handleUpdate("pembayaran", p.id, "sudah")} style={s.btn("#16a34a")}>
                      Verifikasi
                    </button>
                  )}
                  <button onClick={() => removeData("pembayaran", p.id)} style={s.btn("#dc2626")}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Konten Tab 4: Log Pengangkutan */}
      {tab === "pengangkutan" && (
        <table style={s.table}>
          <thead>
            <tr style={{ background: "#f4f4f5", textAlign: "left" }}>
              <th style={s.th}>Nama Warga</th>
              <th style={s.th}>Driver/Courier</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.angkut.map((a) => (
              <tr key={a.id}>
                <td style={s.th}>{a.warga?.nama || "Tidak Diketahui"}</td>
                <td style={s.th}>{a.profiles?.nama || "Belum Ada"}</td>
                <td style={s.th}><b>{a.status}</b></td>
                <td style={s.th}>
                  {a.status !== "selesai" && (
                    <button onClick={() => handleUpdate("pengangkutan", a.id, "selesai")} style={s.btn("#16a34a")}>
                      Selesai
                    </button>
                  )}
                  <button onClick={() => removeData("pengangkutan", a.id)} style={s.btn("#dc2626")}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
        </div>
  </div>
);
}