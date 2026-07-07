<<<<<<< HEAD
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Map from "../components/Map";

export default function Courier() {
  const [tab, setTab] = useState("peta");
  const [wargaList, setWargaList] = useState([]);
  const [pengangkutanList, setPengangkutanList] = useState([]);
  const [myId, setMyId] = useState(null);
  const [transaksiList, setTransaksiList] = useState([]);
  const [transaksiForm, setTransaksiForm] = useState({ jenis: "Pemasukan", nominal: "", keterangan: "" });
  const [loading, setLoading] = useState(false);
=======
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Map, { parseLocation } from "../components/Map";
import { addTransaction, readTransactions } from "../lib/transactions";

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
    background: "#14532d",
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

  card: {
    background: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },

  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  tab: (active) => ({
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    background: active ? "#16a34a" : "#e2e8f0",
    color: active ? "#fff" : "#334155",
  }),

  search: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    marginBottom: "15px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f8fafc",
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #e2e8f0",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
  },

  btn: (color) => ({
    background: color,
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "5px",
  }),

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  statCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  },
};

export default function Courier() {
  const [tab, setTab] = useState("peta");
  const [search, setSearch] = useState("");
  const [myId, setMyId] = useState(null);

  const [data, setData] = useState({
    warga: [],
    tugas: [],
  });
  const [transactions, setTransactions] = useState([]);

  const fetchAll = useCallback(
    async (tid) => {
      const courierId = tid || myId;

      const { data: wargaData } =
        await supabase
          .from("warga")
          .select("*");

      const { data: tugasData } =
        await supabase
          .from("pengangkutan")
          .select(`
            *,
            warga:warga_id(
              id,
              nama,
              alamat,
              location
            )
          `)
          .eq("transporter_id", courierId);

      setData({
        warga: wargaData || [],
        tugas: tugasData || [],
      });

      const localTransactions = readTransactions().filter(
        (item) => item.courier_id === courierId && item.source === "courier"
      );
      setTransactions(localTransactions);
    },
    [myId]
  );

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setMyId(user.id);
        await fetchAll(user.id);
      }
    };

    load();
  }, [fetchAll]);

  const handleAction = async (
    id,
    status
  ) => {
    const { error } = await supabase
      .from("pengangkutan")
      .update({ status })
      .eq("id", id);

    if (!error) {
      alert("Status berhasil diperbarui");
      fetchAll(myId);
    }
  };

  const takeJob = async (wargaId) => {
    const { error } = await supabase
      .from("pengangkutan")
      .insert({
        warga_id: wargaId,
        transporter_id: myId,
        status: "proses",
      });

    if (!error) {
      addTransaction(
        {
          source: "courier",
          courier_id: myId,
          amount: 25000,
          description: "Komisi pengangkutan sampah",
        },
        window.localStorage
      );
      alert("Tugas berhasil diambil dan transaksi keuangan dicatat");
      fetchAll(myId);
    }
  };

  const openRoute = (location) => {
    const pos = parseLocation(location);

    if (!pos) {
      alert("Lokasi tidak valid");
      return;
    }

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${pos.lat},${pos.lng}`,
      "_blank"
    );
  };
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

<<<<<<< HEAD
  const fetchData = async (tid) => {
    try {
      const activeId = tid || myId;

      // 1. Ambil semua warga untuk peta
      const { data: wargaData, error: ew } = await supabase
        .from("warga")
        .select("*, pembayaran(status), pengangkutan(status)");
      if (ew) {
        console.error("Warga error:", ew);
        alert("Gagal ambil warga: " + ew.message);
      } else {
        setWargaList(wargaData || []);
      }

      // 2. Ambil tugas pengangkutan milik saya (tanpa join warga agar tidak 400)
      const { data: angkut, error: ea } = await supabase
        .from("pengangkutan")
        .select("*")
        .eq("courier_id", activeId)
        .order("id", { ascending: false });
      if (ea) {
        console.error("Tugas error:", ea);
        alert("Gagal ambil tugas: " + ea.message);
      } else {
        // Gabungkan data warga secara manual berdasarkan warga_id
        const wargaMap = {};
        (wargaData || []).forEach(w => { wargaMap[w.id] = w; });
        const angkutWithWarga = (angkut || []).map(p => ({
          ...p,
          warga: wargaMap[p.warga_id] || null
        }));
        setPengangkutanList(angkutWithWarga);
      }

      // 3. Ambil transaksi keuangan milik saya (Courier)
      if (activeId) {
        const { data: tx, error: etx } = await supabase
          .from("transaksi_keuangan")
          .select("*")
          .eq("courier_id", activeId)
          .order("created_at", { ascending: false });
        if (etx) {
          console.error("Transaksi error:", etx);
        } else {
          setTransaksiList(tx || []);
        }
      }
    } catch (err) {
      console.error("General error:", err);
    }
  };


  const simpanTransaksi = async () => {
    if (!myId) return alert("Sesi belum siap, silakan muat ulang halaman!");
    const { jenis, nominal, keterangan } = transaksiForm;
    if (!nominal || isNaN(nominal) || parseFloat(nominal) <= 0) {
      return alert("Masukkan nominal transaksi yang valid!");
    }

    setLoading(true);
    const { error } = await supabase
      .from("transaksi_keuangan")
      .insert({
        courier_id: myId,
        jenis,
        nominal: parseFloat(nominal),
        keterangan: keterangan || "",
        status: "Berhasil"
      });

    if (error) {
      console.error(error);
      alert("Gagal simpan transaksi: " + error.message + "\n\nCatatan: Pastikan kebijakan RLS di Supabase sudah benar.");
    } else {
      alert("Transaksi keuangan berhasil disimpan!");
      setTransaksiForm({ jenis: "Pemasukan", nominal: "", keterangan: "" });
      fetchData(myId);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setMyId(user.id);
        fetchData(user.id);
      }
    });
  }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("pengangkutan").update({ status }).eq("id", id);
    if (error) alert(error.message);
    else fetchData();
  };

  // Fungsi untuk buka rute di Google Maps
  const bukaRute = (loc) => {
    if (!loc) return alert("Lokasi tidak tersedia");
    let lat, lng;

    // Jika formatnya Hex (WKB)
    if (typeof loc === "string" && /^[0-9A-F]{30,}$/i.test(loc)) {
      try {
        const hex = loc;
        const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const view = new DataView(bytes.buffer);
        // Cek prefix SRID 4326 (0101000020E6100000)
        if (hex.startsWith("0101000020E6100000")) {
          lng = view.getFloat64(9, true);
          lat = view.getFloat64(17, true);
        } else if (hex.startsWith("0101000000")) {
          lng = view.getFloat64(5, true);
          lat = view.getFloat64(13, true);
        }
      } catch (e) {
        console.error(e);
      }
    } 
    // Jika formatnya String (WKT)
    else if (typeof loc === "string") {
      const m = loc.match(/POINT\s*\(\s*([^ ]+)\s+([^ )]+)\s*\)/i);
      if (m) {
        lng = m[1];
        lat = m[2];
      }
    } 
    // Jika formatnya GeoJSON
    else if (loc.coordinates) {
      lng = loc.coordinates[0];
      lat = loc.coordinates[1];
    }
    
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    } else {
      alert("Format lokasi tidak dikenali");
    }
  };

  const getBadgeClass = (status) => {
    if (!status) return "badge badge-danger";
    const sLower = status.toLowerCase();
    if (sLower === "selesai" || sLower === "sudah") return "badge badge-success";
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

  const totalPemasukan = (transaksiList || [])
    .filter(t => t.jenis === "Pemasukan")
    .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0);
  const totalPengeluaran = (transaksiList || [])
    .filter(t => t.jenis === "Pengeluaran")
    .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0);
  const saldo = totalPemasukan - totalPengeluaran;

  return (
    <div className="theme-transporter container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h2>Dashboard Courier</h2>
          <span className="dashboard-subtitle">Kelola tugas pengangkutan sampah lapangan</span>
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
          Peta Lokasi
        </button>
        <button 
          className={`tab-btn ${tab === "warga" ? "active" : ""}`} 
          onClick={() => setTab("warga")}
        >
          Daftar Warga
        </button>
        <button 
          className={`tab-btn ${tab === "tugas" ? "active" : ""}`} 
          onClick={() => setTab("tugas")}
        >
          Tugas Saya
        </button>
        <button 
          className={`tab-btn ${tab === "keuangan" ? "active" : ""}`} 
          onClick={() => setTab("keuangan")}
        >
          Transaksi Keuangan
        </button>
      </div>

      {/* Tab Contents */}
      {tab === "peta" && (
        <div className="card">
          <h3 className="mb-4">Peta Lokasi Warga</h3>
          <Map data={wargaList} />
        </div>
      )}

      {tab === "warga" && (
        <div className="card">
          <h3 className="mb-4">Daftar Warga untuk Pengangkutan</h3>
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Alamat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {wargaList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="table-empty">Tidak ada data warga tersedia</td>
                  </tr>
                ) : (
                  wargaList.map(w => (
                    <tr key={w.id}>
                      <td><strong>{w.nama}</strong></td>
                      <td>{w.alamat || "-"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-success" 
                            onClick={() => {
                              supabase
                                .from("pengangkutan")
                                .insert({ warga_id: w.id, courier_id: myId, status: "proses" })
                                .then(() => fetchData());
                            }}
                          >
                            Ambil Tugas
                          </button>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => bukaRute(w.location)}
                          >
                            Rute Google Maps
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

      {tab === "tugas" && (
        <div className="card">
          <h3 className="mb-4">Daftar Tugas Saya</h3>
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Warga</th>
                  <th>Alamat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pengangkutanList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="table-empty">Belum ada tugas pengangkutan yang diambil</td>
                  </tr>
                ) : (
                  pengangkutanList.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.warga?.nama}</strong></td>
                      <td>{p.warga?.alamat || "-"}</td>
                      <td>
                        <span className={getBadgeClass(p.status)}>{p.status}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {p.status === "proses" && (
                            <button 
                              className="btn btn-primary" 
                              onClick={() => updateStatus(p.id, "selesai")}
                            >
                              Selesai Pengangkutan
                            </button>
                          )}
                          <button 
                            className="btn btn-outline" 
                            onClick={() => bukaRute(p.warga?.location)}
                          >
                            Rute Peta
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
          {/* Ringkasan Saldo */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 className="mb-4">Ringkasan Keuangan Courier</h3>
            <div className="d-flex gap-3 justify-between" style={{ flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px", padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--emerald-50)", border: "1px solid rgba(5, 150, 105, 0.2)" }}>
                <span className="form-label" style={{ color: "var(--emerald-800)" }}>Total Pemasukan (Gaji/Insentif)</span>
                <h2 style={{ color: "var(--emerald-600)" }}>{formatRupiah(totalPemasukan)}</h2>
              </div>
              <div style={{ flex: "1 1 200px", padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--rose-50)", border: "1px solid rgba(225, 29, 72, 0.2)" }}>
                <span className="form-label" style={{ color: "var(--rose-700)" }}>Total Pengeluaran (Operasional)</span>
                <h2 style={{ color: "var(--rose-600)" }}>{formatRupiah(totalPengeluaran)}</h2>
              </div>
              <div style={{ flex: "1 1 200px", padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--emerald-50)", border: "1px solid rgba(5, 150, 105, 0.2)" }}>
                <span className="form-label" style={{ color: "var(--emerald-800)" }}>Saldo Bersih</span>
                <h2 style={{ color: "var(--emerald-600)" }}>{formatRupiah(saldo)}</h2>
              </div>
            </div>
          </div>

          <div className="grid-dashboard">
            {/* Form Tambah Transaksi */}
            <div className="card">
              <h3>Catat Transaksi Keuangan</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="tx-jenis">Jenis Transaksi</label>
                <select 
                  id="tx-jenis"
                  className="select-field" 
                  value={transaksiForm.jenis}
                  onChange={e => setTransaksiForm({ ...transaksiForm, jenis: e.target.value })}
                >
                  <option value="Pemasukan">Pemasukan (Gaji / Insentif / Tips)</option>
                  <option value="Pengeluaran">Pengeluaran (Bensin / Servis / Operasional)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tx-nominal">Nominal (Rp)</label>
                <input 
                  id="tx-nominal"
                  type="number"
                  className="input-field" 
                  placeholder="Contoh: 50000"
                  value={transaksiForm.nominal}
                  onChange={e => setTransaksiForm({ ...transaksiForm, nominal: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tx-keterangan">Keterangan</label>
                <input 
                  id="tx-keterangan"
                  className="input-field" 
                  placeholder="Keterangan transaksi"
                  value={transaksiForm.keterangan}
                  onChange={e => setTransaksiForm({ ...transaksiForm, keterangan: e.target.value })}
                />
              </div>

              <button 
                className="btn btn-primary btn-block mt-4" 
                onClick={simpanTransaksi}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Transaksi"}
              </button>
            </div>

            {/* Riwayat Transaksi */}
            <div className="card">
              <h3>Riwayat Transaksi Keuangan</h3>
              <p className="text-muted mb-4">
                *Riwayat seluruh mutasi keuangan operasional Anda.
              </p>
              <div className="table-container">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jenis</th>
                      <th>Nominal</th>
                      <th>Keterangan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksiList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="table-empty">Belum ada riwayat transaksi keuangan</td>
                      </tr>
                    ) : (
                      transaksiList.map(t => (
                        <tr key={t.id}>
                          <td>{new Date(t.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                          <td>
                            <span className={t.jenis === "Pemasukan" ? "badge badge-success" : "badge badge-danger"}>
                              {t.jenis}
                            </span>
                          </td>
                          <td><strong>{formatRupiah(t.nominal)}</strong></td>
                          <td>{t.keterangan || "-"}</td>
                          <td>
                            <span className="badge badge-success">{t.status || "Berhasil"}</span>
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
=======
  const filteredWarga =
    data.warga.filter(
      (w) =>
        w.nama
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        w.alamat
          ?.toLowerCase()
          .includes(search.toLowerCase())
    );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2>Dashboard Courier</h2>
            <small>
              Sistem Pengangkutan Sampah
            </small>
          </div>

          <button
            onClick={logout}
            style={styles.logoutBtn}
          >
            Logout
          </button>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <h3>{data.warga.length}</h3>
            <p>Total Warga</p>
          </div>

          <div style={styles.statCard}>
            <h3>{data.tugas.length}</h3>
            <p>Total Tugas</p>
          </div>

          <div style={styles.statCard}>
            <h3>
              {
                data.tugas.filter(
                  (t) =>
                    t.status === "proses"
                ).length
              }
            </h3>
            <p>Dalam Proses</p>
          </div>

          <div style={styles.statCard}>
            <h3>
              {
                data.tugas.filter(
                  (t) =>
                    t.status === "selesai"
                ).length
              }
            </h3>
            <p>Selesai</p>
          </div>

          <div style={styles.statCard}>
            <h3>Rp {transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString("id-ID")}</h3>
            <p>Total Pendapatan</p>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            style={styles.tab(tab === "peta")}
            onClick={() => setTab("peta")}
          >
            Peta Lokasi
          </button>

          <button
            style={styles.tab(tab === "warga")}
            onClick={() => setTab("warga")}
          >
            Daftar Warga
          </button>

          <button
            style={styles.tab(tab === "tugas")}
            onClick={() => setTab("tugas")}
          >
            Tugas Saya
          </button>
        </div>

        {tab === "peta" && (
          <div style={styles.card}>
            <input
              type="text"
              placeholder="Cari nama atau alamat warga..."
              style={styles.search}
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <Map data={filteredWarga} />
          </div>
        )}

        {tab === "warga" && (
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Nama
                  </th>
                  <th style={styles.th}>
                    Alamat
                  </th>
                  <th style={styles.th}>
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredWarga.map((w) => (
                  <tr key={w.id}>
                    <td style={styles.td}>
                      {w.nama}
                    </td>

                    <td style={styles.td}>
                      {w.alamat}
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() =>
                          takeJob(w.id)
                        }
                        style={styles.btn(
                          "#16a34a"
                        )}
                      >
                        Ambil Sampah
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "tugas" && (
          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>Riwayat Transaksi Keuangan</h3>
            {transactions.length === 0 ? (
              <p>Belum ada transaksi keuangan.</p>
            ) : (
              transactions.map((item) => (
                <div key={item.id} style={{ padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <b>Rp {Number(item.amount || 0).toLocaleString("id-ID")}</b> - {item.description}
                </div>
              ))
            )}

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Nama Warga
                  </th>
                  <th style={styles.th}>
                    Alamat
                  </th>
                  <th style={styles.th}>
                    Status
                  </th>
                  <th style={styles.th}>
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.tugas.map((t) => (
                  <tr key={t.id}>
                    <td style={styles.td}>
                      {t.warga?.nama}
                    </td>

                    <td style={styles.td}>
                      {t.warga?.alamat}
                    </td>

                    <td style={styles.td}>
                      <b>{t.status}</b>
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() =>
                          openRoute(
                            t.warga?.location
                          )
                        }
                        style={styles.btn(
                          "#2563eb"
                        )}
                      >
                        Maps
                      </button>

                      {t.status ===
                        "proses" && (
                        <button
                          onClick={() =>
                            handleAction(
                              t.id,
                              "selesai"
                            )
                          }
                          style={styles.btn(
                            "#16a34a"
                          )}
                        >
                          Selesai
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67
    </div>
  );
}