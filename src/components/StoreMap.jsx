import React from "react";

function StoreMap({ storeLocations, selectedCoordinates }) {
  if (!storeLocations.length || !selectedCoordinates) {
    return <p>Loading map...</p>;
  }

  const [latitude, longitude] = selectedCoordinates;
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;

  return (
    <div style={{ width: "40%", background: "#333333", borderRadius: "20px", padding:"15px" }}>
      <h3 style={{color:"white"}}>Selected Store Location</h3>
      <iframe
        title="Selected Store Map"
        src={mapUrl}
        style={{
          border: 0,
          width: "100%",
          height: "430px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}

export default StoreMap;
