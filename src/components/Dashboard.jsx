import React, { useState, useEffect } from "react";
import {
  fetchHourlyData,
  fetchPeakHours,
  fetchPeakDay,
  fetchLiveStats,
  fetchReport,
  fetchStoreLocations,
} from "../services/api";
import LineChart from "./Charts/LineChart";
import PieChart from "./Charts/PieChart";
import BarChart from "./Charts/BarChart";
import StoreMap from "./StoreMap";

function Dashboard({ searchParams, selectedStore }) {
  const [hourlyData, setHourlyData] = useState([]);
  const [peakHour, setPeakHour] = useState(null);
  const [peakDay, setPeakDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeLocations, setStoreLocations] = useState([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetchStoreLocations();
        const formattedLocations = response.data
          .map((loc) => {

            if (loc.geoLoc && typeof loc.geoLoc === "string") {
              const coordinates = loc.geoLoc
                .split(",")
                .map((coord) => parseFloat(coord.trim()));

              if (
                coordinates.length === 2 &&
                !isNaN(coordinates[0]) &&
                !isNaN(coordinates[1])
              ) {
                return { ...loc, coordinates };
              }
            }
            return null; // Exclude invalid locations
          })
          .filter((loc) => loc !== null);

        setStoreLocations(formattedLocations);
        const store = formattedLocations.find(
          (loc) => loc.storeID === selectedStore
        );
        if (store) {
          setSelectedCoordinates(store.coordinates);
        } else {
          setSelectedCoordinates(null); // Handle no valid store case
        }
      } catch (error) {
        console.error("Error fetching store locations:", error);
      }
    };

    fetchLocations();
  }, [selectedStore]);
  useEffect(() => {
    const fetchData = async () => {
      const { startDate, endDate } = searchParams;
      const today = new Date().toISOString().split("T")[0];
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(new Date().getDate() - 10);
      const defaultStartDate = tenDaysAgo.toISOString().split("T")[0];
      const validStartDate = startDate || defaultStartDate;
      const validEndDate = endDate || today;

      try {
        setLoading(true);

        const hourlyResponse = await fetchHourlyData(
          selectedStore,
          `${validStartDate} 00:00:00`,
          `${validEndDate} 23:59:59`
        );

        // Deduplicate data by date
        const uniqueData = Array.from(
          new Map(hourlyResponse.data.map((d) => [d.date, d])).values()
        );

        setHourlyData(uniqueData);

        const peakHourResponse = await fetchPeakHours(selectedStore);
        setPeakHour(peakHourResponse.data);

        const peakDayResponse = await fetchPeakDay(
          selectedStore,
          validStartDate,
          validEndDate
        );
        setPeakDay(peakDayResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, selectedStore]);

  const { startDate, endDate } = searchParams;
  if (loading) {
    return <p>Loading data...</p>;
  }

  return (
    <div id="dashboard-content">
      <div>
        <h3 style={{ marginTop: "10px", color: "white" }}>
          Store: {selectedStore}
        </h3>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
        <div className="tilePeak">
          <h6>Peak Hour</h6>
          <p className="peakHeading">
            {peakHour
              ? `${peakHour.hour}:00 - ${peakHour.total_enter} entries`
              : "N/A"}
          </p>
        </div>
        <div className="tilePeak">
          <h6>Peak Day</h6>
          <p className="peakHeading">
            {peakDay
              ? `${peakDay.day} - ${peakDay.total_enter} entries`
              : "N/A"}
          </p>
        </div>
      </div>

      {hourlyData.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "3%",
            }}
          >
            <LineChart data={hourlyData} />
            <PieChart data={hourlyData} />
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "start",
              justifyContent: "space-around",
              gap: "3%",
            }}
          >
            <BarChart data={hourlyData} />
            <StoreMap
              storeLocations={storeLocations}
              selectedCoordinates={selectedCoordinates}
            />
          </div>
        </div>
      ) : (
        <p>No hourly data available for the selected range.</p>
      )}
    </div>
  );
}

export default Dashboard;
