import React, { useState, useEffect } from "react";
import {
  fetchLiveStats, fetchStoreLocations
} from "../services/api";
const LivePage = ({ searchParams, selectedStore, data }) => {
  const [liveStats, setLiveStats] = useState({});
  const [storeLocations, setStoreLocations] = useState([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetchStoreLocations();
        const formattedLocations = response.data.map((loc) => {
          const [latitude, longitude] = loc.geoLoc
            .split(",")
            .map((coord) => parseFloat(coord.trim()));
          return { ...loc, coordinates: [latitude, longitude] };
        });
        setStoreLocations(formattedLocations);

        // Set coordinates for the selected store
        const store = formattedLocations.find(
          (loc) => loc.storeID === selectedStore
        );
        if (store) {
          setSelectedCoordinates(store.coordinates);
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

      // Default to the last 10 days if dates are not provided
      const today = new Date().toISOString().split("T")[0];
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(new Date().getDate() - 10);
      const defaultStartDate = tenDaysAgo.toISOString().split("T")[0];

      const validStartDate = startDate || defaultStartDate;
      const validEndDate = endDate || today;

      try {
        setLoading(true);

        const liveStatsResponse = await fetchLiveStats(selectedStore);
        setLiveStats(liveStatsResponse.data || {});

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams, selectedStore]);
  return (
    <>
      <div className="statistics-tiles">
        <div className="tile">
          <h6>Today Date</h6>
          <p>{liveStats.date || 0}</p>
        </div>
        <div className="tile">
          <h6>Today Time</h6>
          <p>{liveStats.time || 0}</p>
        </div>
        <div className="tile">
          <h6>LIVE People Entered Today</h6>
          <p>{liveStats.today_enter_count || 0}</p>
        </div>
        <div className="tile">
          <h6>LIVE People Exited Today</h6>
          <p>{liveStats.today_exit_count || 0}</p>
        </div>
        <div className="tile">
          <h6>LIVE People Visited This Hour</h6>
          <p>{liveStats.hr_enter_count || 0}</p>
        </div>
        <div className="tile">
          <h6>LIVE People Exited This Hour</h6>
          <p>{liveStats.hr_exit_count || 0}</p>
        </div>
        <div className="tile">
          <h6>LIVE People Entered Till Today</h6>
          <p>{liveStats.total_enter_count || 0}</p>
        </div>
        <div className="tile">
          <h6>LIVE People Exited Till Today</h6>
          <p>{liveStats.total_exit_count || 0}</p>
        </div>
      </div>
    </>
  )
}
export default LivePage;