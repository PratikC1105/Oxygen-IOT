import React, { useEffect, useState } from "react";
import {
  fetchStores,
  fetchStoreLocations,
  fetchTopStores,
} from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const redIcon = new L.Icon({
  iconUrl: "/assets/red-marker-icon.png",
  iconSize: [40, 40],
});

const yellowIcon = new L.Icon({
  iconUrl: "/assets/yellow-marker-icon.png",
  iconSize: [40, 40],
});

const greenIcon = new L.Icon({
  iconUrl: "/assets/green-marker-icon.png",
  iconSize: [40, 40],
});

const MapView = () => {
  const [totalStores, setTotalStores] = useState(0);
  const [visitorData, setVisitorData] = useState({
    totalVisitors: 0,
    UAE: 0,
    Qatar: 0,
    Saudi: 0,
  });
  const [bestPerformingStores, setBestPerformingStores] = useState([]);
  const [storeLocations, setStoreLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all stores
        const storesResponse = await fetchStores();
        setTotalStores(storesResponse.data.length);

        // Fetch store locations
        const locationsResponse = await fetchStoreLocations();
        const locations = locationsResponse.data.map((store) => ({
          ...store,
          geoLoc: store.geoLoc.trim(),
          location: store.location.trim().toLowerCase(),
          coordinates: store.geoLoc.split(",").map((coord) => parseFloat(coord)),
          total_enter_count: store.total_enter_count || 0,
        }));
        setStoreLocations(locations);

        // Aggregate total visitors
        const totalVisitors = locations.reduce(
          (sum, store) => sum + store.total_enter_count,
          0
        );

        // Filter visitors by country
        const visitorsByCountry = {
          UAE: locations.filter((store) =>
            store.location.includes("dubai") || store.location.includes("uae")
          ).reduce((sum, store) => sum + store.total_enter_count, 0),
          Qatar: locations.filter((store) =>
            store.location.includes("qatar")
          ).reduce((sum, store) => sum + store.total_enter_count, 0),
          Saudi: locations.filter((store) =>
            store.location.includes("saudi")
          ).reduce((sum, store) => sum + store.total_enter_count, 0),
        };

        // Fetch top 10 stores
        const topStoresResponse = await fetchTopStores();
        setBestPerformingStores(topStoresResponse.data);

        // Update visitor data
        setVisitorData({
          totalVisitors,
          UAE: visitorsByCountry.UAE,
          Qatar: visitorsByCountry.Qatar,
          Saudi: visitorsByCountry.Saudi,
        });

        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMarkerIcon = (visitorCount) => {
    if (visitorCount > 3000) return redIcon;
    if (visitorCount > 1000) return yellowIcon;
    return greenIcon;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <div ><h6>Total Stores Connected: </h6>{totalStores}</div>
        <div ><h6>Total Visitors Across Stores: </h6>{visitorData.totalVisitors.toLocaleString()}</div>
        <div ><h6>Visitors in UAE: </h6>{visitorData.UAE.toLocaleString()}</div>
        <div ><h6>Visitors in Qatar: </h6>{visitorData.Qatar.toLocaleString()}</div>
        <div ><h6>Visitors in Saudi: </h6>{visitorData.Saudi.toLocaleString()}</div>
      </div>

      <h3>Top 10 Best Performing Stores (Ascending Order):</h3>
      <table>
        <thead>
          <tr>
            <th>Store Name</th>
            <th>Visitors</th>
          </tr>
        </thead>
        <tbody>
          {bestPerformingStores.map((store, index) => (
            <tr key={index}>
              <td>{store.storeID}</td>
              <td>{store.max_visitors.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 >Map View of Stores:</h3>
      <MapContainer
        center={[25.276987, 55.296249]}
        zoom={10}
        style={{
          height: "500px",
          width: "80%",
          margin: "20px auto",
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {storeLocations.map((store, index) => {
          const [lat, lng] = store.coordinates || [];
          if (!lat || !lng) return null;

          const markerIcon = getMarkerIcon(store.total_enter_count);
          return (
            <Marker key={index} position={[lat, lng]} icon={markerIcon}>
              <Popup>
                <strong>{store.storeID}</strong>
                <br />
                Visitors: {store.total_enter_count.toLocaleString()}
                <br />
                Location: {store.location}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
