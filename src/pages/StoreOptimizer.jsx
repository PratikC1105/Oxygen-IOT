import React, { useEffect, useState } from "react";
import { fetchDailyTotals } from "../services/api";

const StoreOptimizer = ({ searchParams, selectedStore }) => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { startDate, endDate } = searchParams; // Use the updated date range
        const response = await fetchDailyTotals(
          selectedStore,
          `${startDate} 00:00:00`,
          `${endDate} 23:59:59`
        );
        setDailyData(response.data || []);
      } catch (error) {
        console.error("Error fetching daily totals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, selectedStore]); // React to changes in searchParams or selectedStore

  const getHeatColor = (value) => {
    if (value > 50) return "#FF0000b3";
    if (value > 30) return "#FFA500";
    if (value > 10) return "#dddd22";
    return "#D3D3D3";
  };

  return (
    <div className="store-optimizer">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="heatmap-grid">
          {dailyData.map((day) => (
            <div
              key={day.date}
              className="heatmap-cell"
              style={{
                backgroundColor: getHeatColor(day.today_enter_count),
              }}
            >
              <p>{day.date}</p>
              <p>Entries: {day.today_enter_count}</p>
              <p>Exits: {day.today_exit_count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreOptimizer;
