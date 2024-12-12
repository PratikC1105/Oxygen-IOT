import React, { useState, useEffect } from "react";

function SearchForm({ onSearch, initialStartDate, initialEndDate, stores, onStoreChange, selectedStore }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  }, [initialStartDate, initialEndDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ startDate, endDate });
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <label>
        Store:
        <select style={{ marginLeft: "10px" }} value={selectedStore} onChange={(e) => onStoreChange(e.target.value)}>
          {stores.map((store, index) => (
            <option key={index} value={store}>
              {store}
            </option>
          ))}
        </select>
      </label>

      {/* Date Range Inputs */}
      <label>
        Start Date:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>
      <label>
        End Date:
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </label>

      <button className="submitBtn" type="submit">
        Search
      </button>
    </form>
  );
}

export default SearchForm;
