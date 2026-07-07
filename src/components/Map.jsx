import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function parseWKB(hex) {
  try {
    if (!hex) return null;
    if (hex.startsWith("0101000020E6100000")) {
      const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const view = new DataView(bytes.buffer);
      const lng = view.getFloat64(9, true);
      const lat = view.getFloat64(17, true);
      return { lat, lng };
    }
    if (hex.startsWith("0101000000")) {
      const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const view = new DataView(bytes.buffer);
      const lng = view.getFloat64(5, true);
      const lat = view.getFloat64(13, true);
      return { lat, lng };
    }
  } catch (e) {
    console.error("WKB Parse Error:", e);
  }
  return null;
}

export function parseLocation(loc) {
  if (!loc) return null;
  
  if (typeof loc === "string" && /^[0-9A-F]+$/i.test(loc)) {
    const res = parseWKB(loc);
    if (res) return res;
  }

  if (typeof loc === "string") {
    const m = loc.match(/POINT\s*\(\s*([^ ]+)\s+([^ )]+)\s*\)/i);
    if (m) return { lat: parseFloat(m[2]), lng: parseFloat(m[1]) };
  }
  
  if (typeof loc === "object") {
    if (loc.coordinates) return { lat: loc.coordinates[1], lng: loc.coordinates[0] };
    if (loc.lat && loc.lng) return { lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) };
  }
  
  return null;
}

// Auto-center map when center coordinates change
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { 
    if (center) {
      map.setView([center.lat, center.lng], 13); 
    }
  }, [center, map]);
  return null;
}

// Handle map click events
function ClickMarker({ setLatLng }) {
  useMapEvents({ 
    click: (e) => {
      if (setLatLng) setLatLng(e.latlng);
    } 
  });
  return null;
}

export default function Map({ data = [], setLatLng, selectedMarker }) {
  const [keyword, setKeyword] = useState("");
  const [searchMarker, setSearchMarker] = useState(null);

  // Filter markers based on search keyword
  const filteredData = data.filter(
    (item) =>
      item.nama?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.alamat?.toLowerCase().includes(keyword.toLowerCase())
  );

  const firstPos = searchMarker || selectedMarker || parseLocation(filteredData[0]?.location);

  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);

    const found = data.find(
      (item) =>
        item.nama?.toLowerCase().includes(value.toLowerCase()) ||
        item.alamat?.toLowerCase().includes(value.toLowerCase())
    );

    if (found) {
      const pos = parseLocation(found.location);
      if (pos) {
        setSearchMarker(pos);
      }
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Search Input when there is data list */}
      {data.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Cari nama warga atau alamat..."
            value={keyword}
            onChange={handleSearch}
          />
        </div>
      )}

      {filteredData.length === 0 && !selectedMarker && (
        <div className="map-status-overlay">
          Tidak ada data lokasi untuk ditampilkan
        </div>
      )}

      <MapContainer 
        center={[-7.7956, 110.3695]} 
        zoom={13} 
        style={{ 
          height: "350px", 
          borderRadius: "var(--radius-md)", 
          border: "1px solid var(--border)", 
          boxShadow: "var(--shadow-sm)" 
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filteredData.map((item) => {
          const pos = parseLocation(item.location);
          if (!pos) return null;
          return (
            <Marker key={item.id} position={[pos.lat, pos.lng]}>
              <Popup>
                <div style={{ fontSize: 13, fontFamily: "var(--sans)", color: "var(--text-main)" }}>
                  <strong style={{ color: "var(--text-dark)", fontSize: 14 }}>{item.nama}</strong><br/>
                  <span style={{ fontSize: 12, color: "var(--text-light)" }}>{item.alamat || "Alamat tidak tersedia"}</span><br/>
                  <hr style={{ margin: "6px 0", border: "none", borderTop: "1px solid var(--border)" }} />
                  Bayar: {(item.pembayaran || [])[0]?.status || "belum"}<br/>
                  Angkut: {(item.pengangkutan || [])[0]?.status || "-"}
                </div>
              </Popup>
            </Marker>
          );
        })}
        {selectedMarker && <Marker position={[selectedMarker.lat, selectedMarker.lng]} />}
        {setLatLng && <ClickMarker setLatLng={setLatLng} />}
        {firstPos && <ChangeView center={firstPos} />}
      </MapContainer>
    </div>
  );
}
