import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Map from "../components/Map";

export default function Warga() {
  const [user, setUser] = useState(null);
  const [warga, setWarga] = useState(null);
  const [latLng, setLatLng] = useState(null);
  const [form, setForm] = useState({ nama: "", alamat: "", jenis: "", berat: "" });
  const [data, setData] = useState({ sampah: [], bayar: [], angkut: [], transaksi: [] });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("layanan");
  const [transaksiForm, setTransaksiForm] = useState({ jenis: "Pemasukan", nominal: "", keterangan: "" });

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: w } = await supabase
          .from("warga")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (w) {
          setWarga(w);
          setForm(prev => ({ ...prev, nama: w.nama, alamat: w.alamat }));
          refreshData(w.id);
        }
      }
    };
    init();
  }, []);

  const refreshData = async (wid) => {
    const [s, b, a, t] = await Promise.all([
      supabase.from("sampah").select("*").eq("warga_id", wid).order("id", { ascending: false }),
      supabase.from("pembayaran").select("*").eq("warga_id", wid).order("tanggal", { ascending: false }),
      supabase.from("pengangkutan").select("*").eq("warga_id", wid).order("id", { ascending: false }),
      supabase.from("transaksi_keuangan").select("*").eq("warga_id", wid).order("created_at", { ascending: false })
    ]);
    setData({
      sampah: s.data || [],
      bayar: b.data || [],
      angkut: a.data || [],
      transaksi: t.data || []
    });
  };

  const simpanTransaksi = async () => {
    if (!warga) return alert("Simpan profil terlebih dahulu!");
    const { jenis, nominal, keterangan } = transaksiForm;
    if (!nominal || isNaN(nominal) || parseFloat(nominal) <= 0) {
      return alert("Masukkan nominal transaksi yang valid!");
    }

    setLoading(true);
    const { error } = await supabase
      .from("transaksi_keuangan")
      .insert({
        warga_id: warga.id,
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
      refreshData(warga.id);
    }
    setLoading(false);
  };

  const simpanProfil = async () => {
    if (!latLng) return alert("Pilih lokasi di peta terlebih dahulu!");
    setLoading(true);
    const loc = `POINT(${latLng.lng} ${latLng.lat})`;
    const payload = { user_id: user.id, nama: form.nama, alamat: form.alamat, location: loc };
    
    const { data: res, error } = warga 
      ? await supabase.from("warga").update(payload).eq("id", warga.id).select().single()
      : await supabase.from("warga").insert(payload).select().single();

    if (error) {
      alert("Gagal simpan profil: " + error.message);
    } else {
      setWarga(res);
      alert("Profil dan lokasi berhasil disimpan!");
      refreshData(res.id);
    }
    setLoading(false);
  };

  const action = async (table, payload, msg) => {
    if (!warga) return alert("Simpan profil terlebih dahulu!");
    const { error } = await supabase.from(table).insert({ warga_id: warga.id, ...payload });
    if (error) {
      console.error(error);
      alert(`Gagal ${msg}: ${error.message}\n\nCatatan: Pastikan kebijakan RLS di Supabase sudah benar.`);
    } else {
      alert(`${msg} berhasil dilakukan!`);
      refreshData(warga.id);
    }
  };

  const getBadgeClass = (status) => {
    if (!status) return "badge badge-danger";
    const sLower = status.toLowerCase();
    if (sLower === "sudah" || sLower === "selesai") return "badge badge-success";
    if (sLower === "menunggu" || sLower === "proses") return "badge badge-warning";
    return "badge badge-danger";
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const totalPemasukan = (data.transaksi || [])
    .filter(t => t.jenis === "Pemasukan")
    .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0);
  const totalPengeluaran = (data.transaksi || [])
    .filter(t => t.jenis === "Pengeluaran")
    .reduce((sum, t) => sum + parseFloat(t.nominal || 0), 0);
  const saldo = totalPemasukan - totalPengeluaran;

  return (
    <div className="theme-warga container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h2>Dashboard Warga</h2>
          <span className="dashboard-subtitle">Selamat datang di sistem manajemen sampah</span>
        </div>
        <button onClick={logout} className="btn btn-danger">
          Keluar
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${tab === "layanan" ? "active" : ""}`} 
          onClick={() => setTab("layanan")}
        >
          Layanan & Riwayat
        </button>
        <button 
          className={`tab-btn ${tab === "keuangan" ? "active" : ""}`} 
          onClick={() => setTab("keuangan")}
        >
          Transaksi Keuangan
        </button>
      </div>

      {/* Tab Contents */}
      {tab === "layanan" && (
        <div className="grid-dashboard">
          {/* Kolom Kiri: Form Input & Peta */}
          <div>
            {/* Card Profil & Lokasi */}
            <div className="card">
              <h3>Profil dan Lokasi</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="warga-nama">Nama Lengkap</label>
                <input 
                  id="warga-nama"
                  className="input-field" 
                  placeholder="Nama Lengkap" 
                  value={form.nama} 
                  onChange={e => setForm({ ...form, nama: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="warga-alamat">Alamat Rumah</label>
                <input 
                  id="warga-alamat"
                  className="input-field" 
                  placeholder="Alamat Lengkap" 
                  value={form.alamat} 
                  onChange={e => setForm({ ...form, alamat: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tandai Lokasi Rumah Anda di Peta</label>
                <Map setLatLng={setLatLng} selectedMarker={latLng} />
              </div>

              <button 
                className="btn btn-primary btn-block mt-4" 
                onClick={simpanProfil} 
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Profil dan Lokasi"}
              </button>
            </div>

            {/* Card Input & Aksi Sampah */}
            <div className="card">
              <h3>Kirim dan Kelola Sampah</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="sampah-jenis">Jenis Sampah</label>
                <input 
                  id="sampah-jenis"
                  className="input-field" 
                  placeholder="Organik / Anorganik / Lainnya" 
                  value={form.jenis} 
                  onChange={e => setForm({ ...form, jenis: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sampah-berat">Berat Sampah (Kg)</label>
                <input 
                  id="sampah-berat"
                  className="input-field" 
                  type="number" 
                  placeholder="0" 
                  value={form.berat} 
                  onChange={e => setForm({ ...form, berat: e.target.value })} 
                />
              </div>

              <div className="d-flex gap-2 flex-column mt-4">
                <button 
                  className="btn btn-success btn-block" 
                  onClick={() => action("sampah", { jenis: form.jenis, berat: form.berat, status: "menunggu" }, "Kirim Sampah")}
                >
                  Kirim Data Sampah
                </button>
                <button 
                  className="btn btn-warning btn-block" 
                  onClick={() => action("pengangkutan", { status: "Menunggu" }, "Daftar Pengangkutan")}
                >
                  Daftar Pengangkutan
                </button>
                <button 
                  className="btn btn-primary btn-block" 
                  onClick={() => action("pembayaran", { status: "sudah", tanggal: new Date() }, "Pembayaran")}
                >
                  Bayar Iuran
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Status & Riwayat */}
          <div>
            <div className="card">
              <h3>Status dan Riwayat</h3>
              <p className="text-muted mb-4">
                *Jika data tidak langsung muncul, silakan periksa kebijakan RLS pada database Supabase Anda.
              </p>

              <div className="mb-5">
                <h4 className="mb-2">Pengangkutan</h4>
                <div className="table-container">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Courier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.angkut.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="table-empty">Belum ada riwayat pengangkutan</td>
                        </tr>
                      ) : (
                        data.angkut.map(a => (
                          <tr key={a.id}>
                            <td>
                              <span className={getBadgeClass(a.status)}>{a.status}</span>
                            </td>
                            <td>{a.courier_id ? "Courier Ditugaskan" : "Menunggu Courier"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="mb-2">Pembayaran Iuran</h4>
                <div className="table-container">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bayar.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="table-empty">Belum ada riwayat pembayaran</td>
                        </tr>
                      ) : (
                        data.bayar.map(b => (
                          <tr key={b.id}>
                            <td>{new Date(b.tanggal).toLocaleDateString("id-ID")}</td>
                            <td>
                              <span className={getBadgeClass(b.status)}>{b.status}</span>
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
        </div>
      )}

      {tab === "keuangan" && (
        <div>
          {/* Ringkasan Saldo */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 className="mb-4">Ringkasan Keuangan Anda</h3>
            <div className="d-flex gap-3 justify-between" style={{ flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px", padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--emerald-50)", border: "1px solid rgba(5, 150, 105, 0.2)" }}>
                <span className="form-label" style={{ color: "var(--emerald-800)" }}>Total Pemasukan</span>
                <h2 style={{ color: "var(--emerald-600)" }}>{formatRupiah(totalPemasukan)}</h2>
              </div>
              <div style={{ flex: "1 1 200px", padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--rose-50)", border: "1px solid rgba(225, 29, 72, 0.2)" }}>
                <span className="form-label" style={{ color: "var(--rose-700)" }}>Total Pengeluaran</span>
                <h2 style={{ color: "var(--rose-600)" }}>{formatRupiah(totalPengeluaran)}</h2>
              </div>
              <div style={{ flex: "1 1 200px", padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--indigo-50)", border: "1px solid rgba(79, 70, 229, 0.2)" }}>
                <span className="form-label" style={{ color: "var(--indigo-800)" }}>Saldo Aktif</span>
                <h2 style={{ color: "var(--indigo-600)" }}>{formatRupiah(saldo)}</h2>
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
                  <option value="Pemasukan">Pemasukan (Setor Sampah / Tabungan)</option>
                  <option value="Pengeluaran">Pengeluaran (Bayar Iuran / Tarik Tunai)</option>
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
                *Riwayat seluruh mutasi pemasukan dan pengeluaran Anda.
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
                    {(data.transaksi || []).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="table-empty">Belum ada riwayat transaksi keuangan</td>
                      </tr>
                    ) : (
                      (data.transaksi || []).map(t => (
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