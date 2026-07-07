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

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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
    </div>
  );
}