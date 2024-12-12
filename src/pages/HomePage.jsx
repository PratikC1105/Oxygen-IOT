import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="home">
      <h1>Welcome to Oxygen IOT people analysis</h1>
      <Link to="/admin" className="btn">
        Go to Admin Dashboard
      </Link>
    </div>
  );
}

export default HomePage;
