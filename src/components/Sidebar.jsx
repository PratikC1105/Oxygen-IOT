import React, { useState } from "react";
const Sidebar = ({ onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {isOpen && (
        <ul>
          <li onClick={() => onPageChange("Dashboard")}>Over All Panel</li>
          <li onClick={() => onPageChange("MapView")}>Map View</li>
          <li onClick={() => onPageChange("LivePage")}>Live Page</li>
          <li onClick={() => onPageChange("StoreWise")}>Store Wise</li>
          {/* <li onClick={() => onPageChange("")}>Settings</li> */}
        </ul>
      )}
      {/* Circle-shaped toggle button */}
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? "❮" : "❯"} {/* Left or right arrow */}
      </button>
    </div>
  );
};

export default Sidebar;
