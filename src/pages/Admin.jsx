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

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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
}