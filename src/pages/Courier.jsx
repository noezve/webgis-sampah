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

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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
    </div>
  );
}