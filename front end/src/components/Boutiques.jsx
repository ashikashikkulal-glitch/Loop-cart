import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./Boutiques.css";

// Custom purple marker
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
});

const boutiquesData = [
  {
    name: "LoopCart Downtown",
    address: "123 MG Road, Bangalore",
    phone: "8088462828",
    appointment: "By Appointment",
    position: [12.9716, 77.5946],
  },
  {
    name: "LoopCart Midtown",
    address: "456 Brigade Road, Bangalore",
    phone: "8088462828",
    appointment: "By Appointment",
    position: [12.9735, 77.6205],
  },
  {
    name: "LoopCart Uptown",
    address: "789 Indiranagar, Bangalore",
    phone: "8088462828",
    appointment: "By Appointment",
    position: [12.9789, 77.6408],
  },
  {
    name: "LoopCart Westside",
    address: "321 Jayanagar, Bangalore",
    phone: "8088462828",
    appointment: "By Appointment",
    position: [12.9304, 77.5839],
  },
  {
    name: "LoopCart Eastside",
    address: "654 Koramangala, Bangalore",
    phone: "8088462828",
    appointment: "By Appointment",
    position: [12.9352, 77.6245],
  },
  {
    name: "LoopCart Northside",
    address: "987 Malleswaram, Bangalore",
    phone: "8088462828",
    appointment: "By Appointment",
    position: [13.0097, 77.5695],
  },
];

const Boutiques = () => {
  const [search, setSearch] = useState("");

  const filteredBoutiques = boutiquesData.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="boutiques-section">
      <div className="container text-center">
        <h2 className="text-gradient mb-3">Our Exclusive Boutiques</h2>
        <p className="subtitle mb-4">
          Experience luxury shopping at our curated locations
        </p>

        {/* Search Bar and Filter */}
        <div className="search-filter mb-4">
          <input
            type="text"
            className="search-input"
            placeholder="Enter your city or zip code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="search-btn">Discover</button>
          <select className="dropdown">
            <option>All Boutiques</option>
            <option>Downtown</option>
            <option>Midtown</option>
            <option>Uptown</option>
            <option>Westside</option>
            <option>Eastside</option>
            <option>Northside</option>
          </select>
        </div>

        {/* Map */}
        <div className="map-container mb-5">
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            scrollWheelZoom={false}
            style={{ height: "350px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />
            {filteredBoutiques.map((b, i) => (
              <Marker key={i} position={b.position} icon={markerIcon}>
                <Popup>{b.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Boutique Cards */}
        <div className="row">
          {filteredBoutiques.map((b, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="boutique-card text-start">
                <h5>{b.name}</h5>
                <p>
                  📍 {b.address} <br />
                  📞 {b.phone} <br />
                  🕓 {b.appointment}
                </p>
                <button className="btn-gradient mt-2">Get Directions</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Boutiques;
