import React, { useState, useEffect } from "react";
import Dashboard from "../components/Dashboard";
import SearchForm from "../components/SearchForm";
import StoreOptimizer from "./StoreOptimizer";
import Sidebar from "../components/Sidebar"; // Updated Sidebar Component
import { fetchHourlyData, fetchStores } from "../services/api";
import LivePage from "./LivePage";
import MapView from "./MapView";
import StoreWise from "./StoreWise";

const AdminPage = () => {
  const [stores, setStores] = useState([]); // List of stores
  const [selectedStore, setSelectedStore] = useState("ASWAQ Barsha"); // Default store
  const [searchParams, setSearchParams] = useState({
    startDate: "",
    endDate: "",
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("Dashboard");

  // Calculate today's date and 10 days before
  useEffect(() => {
    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);

    const formattedToday = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    const formattedTenDaysAgo = tenDaysAgo.toISOString().split("T")[0];

    setSearchParams({
      startDate: formattedTenDaysAgo,
      endDate: formattedToday,
    });
  }, []);

  useEffect(() => {
    const fetchAvailableStores = async () => {
      try {
        const response = await fetchStores();
        setStores(response.data || []); // Populate store options
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchAvailableStores();
  }, []);

  const handleSearch = async (params) => {
    setSearchParams(params);
    setLoading(true);
    try {
      const { startDate, endDate } = params;
      const response = await fetchHourlyData(
        selectedStore,
        `${startDate} 00:00:00`,
        `${endDate} 23:59:59`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreChange = (store) => {
    setSelectedStore(store); // Update selected store
  };

  const renderContent = () => {
    if (currentPage === "Dashboard") {
      return (
        <>
          <h1 style={{ margin: "0", paddingTop: "15px", color: "white" }}>Dashboard</h1>
          <SearchForm
            onSearch={handleSearch}
            initialStartDate={searchParams.startDate}
            initialEndDate={searchParams.endDate}
            stores={stores} // Pass the list of stores
            onStoreChange={handleStoreChange} // Handle store selection
            selectedStore={selectedStore} // Pass selected store
          />
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Dashboard
              data={data}
              searchParams={searchParams}
              selectedStore={selectedStore}
            />
          )}
        </>
      );
    } else if (currentPage === "Store Optimizer") {
      return (
        <>
          <h1 style={{ margin: "0", paddingTop: "15px" }}>Store Optimizer</h1>
          <SearchForm
            onSearch={handleSearch}
            initialStartDate={searchParams.startDate}
            initialEndDate={searchParams.endDate}
            stores={stores}
            onStoreChange={handleStoreChange}
            selectedStore={selectedStore}
          />
          <StoreOptimizer
            searchParams={searchParams}
            selectedStore={selectedStore}
          />
        </>
      );
    } else if (currentPage === "LivePage") {
      return (
        <>
          <h1 style={{ margin: "0", paddingTop: "15px" }}>Live Page</h1>
          <SearchForm
            onSearch={handleSearch}
            initialStartDate={searchParams.startDate}
            initialEndDate={searchParams.endDate}
            stores={stores}
            onStoreChange={handleStoreChange}
            selectedStore={selectedStore}
          />
          <LivePage data={data}
            searchParams={searchParams}
            selectedStore={selectedStore} />
        </>
      );
    } else if (currentPage === "MapView") {
      return (
        <>
          <h1 style={{ margin: "0", paddingTop: "15px" }}>Map View</h1>
          {/* <SearchForm
            onSearch={handleSearch}
            initialStartDate={searchParams.startDate}
            initialEndDate={searchParams.endDate}
            stores={stores}
            onStoreChange={handleStoreChange}
            selectedStore={selectedStore}
          /> */}
          <MapView />
        </>
      );
    } else if (currentPage === "StoreWise") {
      return (
        <>
          <h1 style={{ margin: "0", paddingTop: "15px" }}>Store Wise Performance</h1>
          <SearchForm
            onSearch={handleSearch}
            initialStartDate={searchParams.startDate}
            initialEndDate={searchParams.endDate}
            stores={stores}
            onStoreChange={handleStoreChange}
            selectedStore={selectedStore}
          />
          <StoreWise
            selectedStore={selectedStore}
            searchParams={searchParams}
          />
        </>
      );
    }
  };

  return (
    <div className="admin-page">
      <Sidebar onPageChange={setCurrentPage} />
      <div className="content">{renderContent()}</div>
    </div>
  );
};

export default AdminPage;
