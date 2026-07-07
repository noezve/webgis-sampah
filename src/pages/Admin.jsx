<<<<<<< HEAD
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Map from "../components/Map";

export default function Admin() {
  const [tab, setTab] = useState("peta");
  const [wargaList, setWargaList] = useState([]);
  const [pembayaranList, setPembayaranList] = useState([]);
  const [pengangkutanList, setPengangkutanList] = useState([]);
  const [filterBayar, setFilterBayar] = useState("semua");
  const [transaksiList, setTransaksiList] = useState([]);
=======
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
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

<<<<<<< HEAD
  const fetchAll = async () => {
    try {
      // 1. Ambil warga
      const { data: w, error: ew } = await supabase
        .from("warga")
        .select("*, pembayaran(status), pengangkutan(status)");
      console.log("Fetched Warga:", w);
      if (ew) {
        console.error("Warga error:", ew);
        alert("Gagal ambil warga: " + ew.message);
      } else {
        setWargaList(w || []);
      }

      // 2. Ambil pembayaran
      const { data: b, error: eb } = await supabase
        .from("pembayaran")
        .select("*, warga(nama)")
        .order("tanggal", { ascending: false });
      if (eb) {
        console.error("Pembayaran error:", eb);
        alert("Gagal ambil pembayaran: " + eb.message);
      } else {
        setPembayaranList(b || []);
      }

      // 3. Ambil pengangkutan
      const { data: a, error: ea } = await supabase
        .from("pengangkutan")
        .select("*, warga(nama), profiles(nama)")
        .order("id", { ascending: false });
      if (ea) {
        console.error("Pengangkutan error:", ea);
        alert("Gagal ambil pengangkutan: " + ea.message + "\n\nTip: Cek kebijakan RLS di tabel 'profiles' agar tidak rekursif.");
      } else {
        setPengangkutanList(a || []);
      }

      // 4. Ambil semua transaksi keuangan
      const { data: tx, error: etx } = await supabase
        .from("transaksi_keuangan")
        .select("*, warga(nama), profiles(nama)")
        .order("created_at", { ascending: false });
      if (etx) {
        console.error("Transaksi error:", etx);
      } else {
        setTransaksiList(tx || []);
      }
    } catch (err) {
      console.error("General error:", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const verifikasi = async (table, id, status) => {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (error) alert(error.message);
    else fetchAll();
  };

  const hapusData = async (table, id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) alert(error.message);
    else fetchAll();
  };

  // LOGIKA FILTER PETA
  const dataPeta = wargaList.filter(w => {
    if (filterBayar === "semua") return true;
    const isSudah = (w.pembayaran || []).some(p => p.status === "sudah");
    return filterBayar === "sudah" ? isSudah : !isSudah;
  });

  const getBadgeClass = (status) => {
    if (!status) return "badge badge-danger";
    const sLower = status.toLowerCase();
    if (sLower === "sudah" || sLower === "selesai") return "badge badge-success";
    if (sLower === "proses" || sLower === "menunggu") return "badge badge-warning";
    return "badge badge-danger";
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const wargaTransactions = transaksiList.filter(t => t.warga_id !== null);
  const totalWargaPemasukan = wargaTransactions
    .filter(t => t.jenis === "Pemasukan")
    .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0);
  const totalWargaPengeluaran = wargaTransactions
    .filter(t => t.jenis === "Pengeluaran")
    .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0);
  const wargaSaldo = totalWargaPemasukan - totalWargaPengeluaran;

  const courierTransactions = transaksiList.filter(t => t.courier_id !== null);
  const totalCourierPemasukan = courierTransactions
    .filter(t => t.jenis === "Pemasukan")
    .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0);
  const totalCourierPengeluaran = courierTransactions
    .filter(t => t.jenis === "Pengeluaran")
    .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0);
  const courierSaldo = totalCourierPemasukan - totalCourierPengeluaran;

  return (
    <div className="theme-admin container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h2>Dashboard Admin</h2>
          <span className="dashboard-subtitle">Kelola dan pantau seluruh sistem pengangkutan sampah</span>
        </div>
        <button onClick={logout} className="btn btn-danger">
          Keluar
        </button>
      </header>
      
      {/* Tab Navigation */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${tab === "peta" ? "active" : ""}`} 
          onClick={() => setTab("peta")}
        >
          Peta Pemantauan
        </button>
        <button 
          className={`tab-btn ${tab === "warga" ? "active" : ""}`} 
          onClick={() => setTab("warga")}
        >
          Data Warga
        </button>
        <button 
          className={`tab-btn ${tab === "pembayaran" ? "active" : ""}`} 
          onClick={() => setTab("pembayaran")}
        >
          Verifikasi Pembayaran
        </button>
        <button 
          className={`tab-btn ${tab === "pengangkutan" ? "active" : ""}`} 
          onClick={() => setTab("pengangkutan")}
        >
          Data Pengangkutan
        </button>
        <button 
          className={`tab-btn ${tab === "keuangan" ? "active" : ""}`} 
          onClick={() => setTab("keuangan")}
        >
          Laporan Keuangan
        </button>
      </div>

      {/* Tab Contents */}
      {tab === "peta" && (
        <div className="card">
          <div className="d-flex align-center gap-3 mb-4 flex-wrap">
            <span className="form-label mb-0">Filter Status Pembayaran Warga:</span>
            <div className="tabs-container mb-0" style={{ gap: "4px" }}>
              {["semua", "sudah", "belum"].map(f => (
                <button 
                  key={f} 
                  className={`tab-btn ${filterBayar === f ? "active" : ""}`} 
                  onClick={() => setFilterBayar(f)}
                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <Map data={dataPeta} />
        </div>
      )}

      {tab === "warga" && (
        <div className="card">
          <h3 className="mb-4">Data Registrasi Warga</h3>
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Alamat</th>
                  <th>Status Pembayaran</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {wargaList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="table-empty">Tidak ada data warga tersedia</td>
                  </tr>
                ) : (
                  wargaList.map(w => (
                    <tr key={w.id}>
                      <td><strong>{w.nama}</strong></td>
                      <td>{w.alamat || "-"}</td>
                      <td>
                        <span className={getBadgeClass(w.pembayaran?.[0]?.status)}>
                          {w.pembayaran?.[0]?.status || "belum"}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => hapusData("warga", w.id)} 
                          className="btn btn-danger btn-outline"
                          style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                        >
                          Hapus Warga
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "pembayaran" && (
        <div className="card">
          <h3 className="mb-4">Daftar Verifikasi Pembayaran Iuran</h3>
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Warga</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pembayaranList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="table-empty">Belum ada transaksi pembayaran masuk</td>
                  </tr>
                ) : (
                  pembayaranList.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.warga?.nama || "Tidak Dikenal"}</strong></td>
                      <td>{new Date(p.tanggal).toLocaleDateString("id-ID")}</td>
                      <td>
                        <span className={getBadgeClass(p.status)}>{p.status}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {p.status !== "sudah" && (
                            <button 
                              onClick={() => verifikasi("pembayaran", p.id, "sudah")} 
                              className="btn btn-success"
                              style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                            >
                              Verifikasi
                            </button>
                          )}
                          <button 
                            onClick={() => hapusData("pembayaran", p.id)} 
                            className="btn btn-danger btn-outline"
                            style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "pengangkutan" && (
        <div className="card">
          <h3 className="mb-4">Daftar Pengangkutan Sampah</h3>
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Warga</th>
                  <th>Courier</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pengangkutanList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="table-empty">Belum ada pengajuan pengangkutan sampah</td>
                  </tr>
                ) : (
                  pengangkutanList.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.warga?.nama || "Tidak Dikenal"}</strong></td>
                      <td>{p.profiles?.nama || "Belum Ditugaskan"}</td>
                      <td>
                        <span className={getBadgeClass(p.status)}>{p.status}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {p.status !== "selesai" && (
                            <button 
                              onClick={() => verifikasi("pengangkutan", p.id, "selesai")} 
                              className="btn btn-success"
                              style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                            >
                              Set Selesai
                            </button>
                          )}
                          <button 
                            onClick={() => hapusData("pengangkutan", p.id)} 
                            className="btn btn-danger btn-outline"
                            style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "keuangan" && (
        <div>
          {/* Rekap Ringkasan Keuangan */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 className="mb-4">Laporan Keuangan Sistem</h3>
            <div className="grid-dashboard" style={{ gap: "1.5rem" }}>
              {/* Warga Box */}
              <div style={{ padding: "1.25rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--indigo-50)", border: "1px solid rgba(79, 70, 229, 0.2)" }}>
                <h4 style={{ color: "var(--indigo-800)", marginBottom: "1rem" }}>Total Transaksi Keuangan Warga</h4>
                <div className="d-flex justify-between mb-2">
                  <span>Total Pemasukan:</span>
                  <strong style={{ color: "var(--emerald-600)" }}>{formatRupiah(totalWargaPemasukan)}</strong>
                </div>
                <div className="d-flex justify-between mb-2">
                  <span>Total Pengeluaran:</span>
                  <strong style={{ color: "var(--rose-600)" }}>{formatRupiah(totalWargaPengeluaran)}</strong>
                </div>
                <hr style={{ margin: "8px 0", borderColor: "rgba(79, 70, 229, 0.2)" }} />
                <div className="d-flex justify-between">
                  <strong>Saldo Bersih Warga:</strong>
                  <strong>{formatRupiah(wargaSaldo)}</strong>
                </div>
              </div>

              {/* Courier Box */}
              <div style={{ padding: "1.25rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--emerald-50)", border: "1px solid rgba(5, 150, 105, 0.2)" }}>
                <h4 style={{ color: "var(--emerald-800)", marginBottom: "1rem" }}>Total Transaksi Keuangan Courier</h4>
                <div className="d-flex justify-between mb-2">
                  <span>Total Pemasukan:</span>
                  <strong style={{ color: "var(--emerald-600)" }}>{formatRupiah(totalCourierPemasukan)}</strong>
                </div>
                <div className="d-flex justify-between mb-2">
                  <span>Total Pengeluaran:</span>
                  <strong style={{ color: "var(--rose-600)" }}>{formatRupiah(totalCourierPengeluaran)}</strong>
                </div>
                <hr style={{ margin: "8px 0", borderColor: "rgba(5, 150, 105, 0.2)" }} />
                <div className="d-flex justify-between">
                  <strong>Saldo Bersih Courier:</strong>
                  <strong>{formatRupiah(courierSaldo)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Tabel Detail */}
          <div className="grid-dashboard">
            {/* Tabel Detail Warga */}
            <div className="card">
              <h3 className="mb-4">Detail Keuangan Warga</h3>
              <div className="table-container">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Warga</th>
                      <th>Jenis</th>
                      <th>Nominal</th>
                      <th>Keterangan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wargaTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="table-empty">Belum ada transaksi warga</td>
                      </tr>
                    ) : (
                      wargaTransactions.map(t => (
                        <tr key={t.id}>
                          <td>{new Date(t.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</td>
                          <td><strong>{t.warga?.nama || "Tidak Dikenal"}</strong></td>
                          <td>
                            <span className={t.jenis === "Pemasukan" ? "badge badge-success" : "badge badge-danger"}>
                              {t.jenis}
                            </span>
                          </td>
                          <td><strong>{formatRupiah(t.nominal)}</strong></td>
                          <td><span style={{ fontSize: "0.8rem" }}>{t.keterangan || "-"}</span></td>
                          <td>
                            <button 
                              onClick={() => hapusData("transaksi_keuangan", t.id)} 
                              className="btn btn-danger btn-outline"
                              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabel Detail Courier */}
            <div className="card">
              <h3 className="mb-4">Detail Keuangan Courier</h3>
              <div className="table-container">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Courier</th>
                      <th>Jenis</th>
                      <th>Nominal</th>
                      <th>Keterangan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courierTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="table-empty">Belum ada transaksi courier</td>
                      </tr>
                    ) : (
                      courierTransactions.map(t => (
                        <tr key={t.id}>
                          <td>{new Date(t.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</td>
                          <td><strong>{t.profiles?.nama || "Tidak Dikenal"}</strong></td>
                          <td>
                            <span className={t.jenis === "Pemasukan" ? "badge badge-success" : "badge badge-danger"}>
                              {t.jenis}
                            </span>
                          </td>
                          <td><strong>{formatRupiah(t.nominal)}</strong></td>
                          <td><span style={{ fontSize: "0.8rem" }}>{t.keterangan || "-"}</span></td>
                          <td>
                            <button 
                              onClick={() => hapusData("transaksi_keuangan", t.id)} 
                              className="btn btn-danger btn-outline"
                              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
=======
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
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67
}