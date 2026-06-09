/* eslint-disable react-refresh/only-export-components */

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// =============================
// FIX LEAFLET ICON
// =============================
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =============================
// PARSE LOCATION
// =============================
export const parseLocation = (loc) => {
  if (!loc) return null;

  // WKB HEX PostGIS
  if (
    typeof loc === "string" &&
    /^[0-9A-F]+$/i.test(loc)
  ) {
    try {
      const bytes = new Uint8Array(
        loc.match(/.{1,2}/g).map((b) =>
          parseInt(b, 16)
        )
      );

      const view = new DataView(bytes.buffer);

      return {
        lng: view.getFloat64(9, true),
        lat: view.getFloat64(17, true),
      };
    } catch (err) {
      console.error(err);
    }
  }

  // POINT(lng lat)
  if (typeof loc === "string") {
    const m = loc.match(
      /POINT\s*\(\s*([^ ]+)\s+([^)]+)\s*\)/i
    );

    if (m) {
      return {
        lat: parseFloat(m[2]),
        lng: parseFloat(m[1]),
      };
    }
  }

  // GeoJSON
  if (typeof loc === "object") {
    if (loc.coordinates) {
      return {
        lat: loc.coordinates[1],
        lng: loc.coordinates[0],
      };
    }

    if (
      typeof loc.lat === "number" &&
      typeof loc.lng === "number"
    ) {
      return loc;
    }
  }

  return null;
};

// =============================
// EVENT MAP
// =============================
function MapEvents({ setLatLng, center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(
        [center.lat, center.lng],
        15
      );
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      if (setLatLng) {
        setLatLng(e.latlng);
      }
    },
  });

  return null;
}

// =============================
// COMPONENT
// =============================
export default function Map({
  data = [],
  setLatLng,
  selectedMarker,
}) {
  const [keyword, setKeyword] =
    useState("");

  const [searchMarker, setSearchMarker] =
    useState(null);

  const filteredData = data.filter(
    (item) =>
      item.nama
        ?.toLowerCase()
        .includes(keyword.toLowerCase()) ||
      item.alamat
        ?.toLowerCase()
        .includes(keyword.toLowerCase())
  );

  const firstLocation =
    filteredData.length > 0
      ? parseLocation(
          filteredData[0]?.location
        )
      : null;

  const center =
    searchMarker ||
    selectedMarker ||
    firstLocation || {
      lat: -7.7956,
      lng: 110.3695,
    };

  const handleSearch = (e) => {
    const value = e.target.value;

    setKeyword(value);

    const found = data.find(
      (item) =>
        item.nama
          ?.toLowerCase()
          .includes(
            value.toLowerCase()
          ) ||
        item.alamat
          ?.toLowerCase()
          .includes(
            value.toLowerCase()
          )
    );

    if (found) {
      const pos = parseLocation(
        found.location
      );

      if (pos) {
        setSearchMarker(pos);
      }
    }
  };

  return (
    <div>
      {/* SEARCH */}
      <input
        type="text"
        placeholder="🔍 Cari nama warga atau alamat..."
        value={keyword}
        onChange={handleSearch}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "8px",
          border:
            "1px solid #d1d5db",
        }}
      />

      <MapContainer
        center={[
          center.lat,
          center.lng,
        ]}
        zoom={13}
        style={{
          height: "350px",
          borderRadius: "10px",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents
          setLatLng={setLatLng}
          center={center}
        />

        {filteredData.map(
          (item, i) => {
            const pos =
              parseLocation(
                item.location
              );

            if (!pos) return null;

            return (
              <Marker
                key={i}
                position={[
                  pos.lat,
                  pos.lng,
                ]}
              >
                <Popup>
                  <b>{item.nama}</b>

                  <br />

                  {item.alamat}

                  <br />

                  Status:
                  {" "}
                  {item
                    .pembayaran?.[0]
                    ?.status ||
                    "Belum Bayar"}
                </Popup>
              </Marker>
            );
          }
        )}

        {selectedMarker && (
          <Marker
            position={[
              selectedMarker.lat,
              selectedMarker.lng,
            ]}
          />
        )}
      </MapContainer>
    </div>
  );
}