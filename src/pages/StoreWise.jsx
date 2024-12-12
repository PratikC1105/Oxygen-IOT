import React, { useState, useEffect } from "react";
import {
  fetchLiveStats,
  fetchDailyTotals,
  fetchPeakHours,
  fetchPeakDay,
  fetchTopPerformingDays,
  fetchHourlyData,
} from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";

const StoreWise = ({ selectedStore, searchParams }) => {
  const [stats, setStats] = useState({
    totalVisitors: null,
    totalVisitorsLastMonth: null,
    totalVisitorsThisMonth: null,
    totalVisitorsTillDate: null,
    bestPerformingDay: null,
    bestPerformingHour: null,
    maxVisitedDay: null,
    storePerformanceComparedToLastMonth: null,
    storePerformanceComparedToLastHour: null,
    storePerformanceComparedToLastWeek: null,
    comparisonTodayYesterday: null,
    topDays: [],
  });
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      setLoading(true);

      const { startDate, endDate } = searchParams;
      const currentDate = new Date();

      // Create a separate instance for yesterday's date
      const yesterdayDate = new Date(currentDate);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);

      // Calculate previous month's first and last dates
      const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        .toISOString()
        .split("T")[0];
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
        .toISOString()
        .split("T")[0];

      // Fetch required data
      const liveStats = await fetchLiveStats(selectedStore);
      const peakHour = await fetchPeakHours(selectedStore);
      const peakDay = await fetchPeakDay(selectedStore, startDate, endDate);
      const dailyReport = await fetchTopPerformingDays(selectedStore);

      // Fetch data for last month dynamically
      const lastMonthReport = await fetchTopPerformingDays(
        selectedStore,
        lastMonthStart,
        lastMonthEnd
      );

      const totalVisitorsLastMonth = lastMonthReport.data.reduce(
        (sum, day) => sum + (parseInt(day.total_visitors, 10) || 0),
        0
      );

      const totalVisitorsThisMonth = dailyReport.data.reduce(
        (sum, day) => sum + (parseInt(day.total_visitors, 10) || 0),
        0
      );

      const storePerformanceComparedToLastMonth =
        totalVisitorsLastMonth > 0
          ? ((totalVisitorsThisMonth - totalVisitorsLastMonth) / totalVisitorsLastMonth) * 100
          : null;

      // Calculate Maximum Visited Day
      const maxVisitedDay = dailyReport.data.reduce((max, day) =>
        day.total_visitors > max.total_visitors ? day : max,
        { day: "N/A", total_visitors: 0 }
      );

      // Calculate Store Performance Compared to Last Hour
      const currentHour = new Date();
      const oneHourAgo = new Date(currentHour.getTime() - 60 * 60 * 1000);
      const hourlyData = await fetchHourlyData(
        selectedStore,
        oneHourAgo.toISOString(),
        currentHour.toISOString()
      );

      const lastHourVisitors = hourlyData.data.reduce(
        (sum, record) => sum + (record.hr_enter_count || 0),
        0
      );

      const storePerformanceComparedToLastHour =
        lastHourVisitors > 0
          ? ((liveStats.data?.total_enter_count - lastHourVisitors) / lastHourVisitors) * 100
          : null;

      // Calculate Store Performance Compared to Last Week
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeekHourlyData = await fetchHourlyData(
        selectedStore,
        lastWeekDate.toISOString(),
        lastWeekDate.toISOString()
      );

      const lastWeekVisitors = lastWeekHourlyData.data.reduce(
        (sum, record) => sum + (record.hr_enter_count || 0),
        0
      );

      const storePerformanceComparedToLastWeek =
        lastWeekVisitors > 0
          ? ((liveStats.data?.total_enter_count - lastWeekVisitors) / lastWeekVisitors) * 100
          : null;

      // Top 10 best-performing days
      const topDays = dailyReport.data
        .sort((a, b) => b.total_visitors - a.total_visitors)
        .slice(0, 10);

      // Fetch comparison for today vs. yesterday
      const todayDate = currentDate.toISOString().split("T")[0];
      const yesterdayISO = yesterdayDate.toISOString().split("T")[0];

      const todayData = dailyReport.data.find((day) => day.day === todayDate) || {};
      const yesterdayData = dailyReport.data.find((day) => day.day === yesterdayISO) || {};

      const comparisonTodayYesterday =
        yesterdayData.total_visitors > 0
          ? (((todayData.total_visitors || 0) - yesterdayData.total_visitors) /
            yesterdayData.total_visitors) *
          100
          : "N/A";

      setStats({
        totalVisitors: liveStats.data?.total_enter_count || 0,
        totalVisitorsLastMonth,
        totalVisitorsThisMonth,
        totalVisitorsTillDate: liveStats.data?.total_enter_count || 0,
        bestPerformingDay: peakDay.data?.day || "N/A",
        bestPerformingHour: peakHour.data?.hour || "N/A",
        maxVisitedDay: maxVisitedDay.day || "N/A",
        storePerformanceComparedToLastMonth,
        storePerformanceComparedToLastHour,
        storePerformanceComparedToLastWeek,
        comparisonTodayYesterday, // Add comparison between today and yesterday
        topDays,
      });
    } catch (error) {
      console.error("Error fetching store performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStore, searchParams]);

  // Function to generate the PDF report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Store Performance Report", 105, 10, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Store: ${selectedStore}`, 10, 20);
    doc.text(
      `Date Range: ${searchParams.startDate} to ${searchParams.endDate}`,
      10,
      30
    );

    // Metrics table
    doc.autoTable({
      head: [["Metric", "Value"]],
      body: [
        ["Total Visitors", stats.totalVisitors.toLocaleString()],
        ["Total Visitors Last Month", stats.totalVisitorsLastMonth.toLocaleString()],
        ["Total Visitors This Month", stats.totalVisitorsThisMonth.toLocaleString()],
        ["Total Visitors Till Date", stats.totalVisitorsTillDate.toLocaleString()],
        ["Best Performing Day", stats.bestPerformingDay],
        ["Best Performing Hour", stats.bestPerformingHour],
        ["Maximum Visited Day", stats.maxVisitedDay],
        [
          "Performance Compared to Last Month",
          typeof stats.storePerformanceComparedToLastMonth === "number"
            ? `${stats.storePerformanceComparedToLastMonth.toFixed(2)}%`
            : "N/A",
        ],
        [
          "Performance Compared to Last Hour",
          typeof stats.storePerformanceComparedToLastHour === "number"
            ? `${stats.storePerformanceComparedToLastHour.toFixed(2)}%`
            : "N/A",
        ],
        [
          "Performance Compared to Last Week",
          typeof stats.storePerformanceComparedToLastWeek === "number"
            ? `${stats.storePerformanceComparedToLastWeek.toFixed(2)}%`
            : "N/A",
        ],
        [
          "Comparison Between Today & Yesterday",
          typeof stats.comparisonTodayYesterday === "number"
            ? `${stats.comparisonTodayYesterday.toFixed(2)}%`
            : stats.comparisonTodayYesterday || "N/A",
        ],
      ],
      startY: 40,
    });

    // Top-performing days table
    doc.autoTable({
      head: [["Rank", "Date", "Visitors"]],
      body: stats.topDays.map((day, index) => [
        index + 1,
        new Date(day.day).toLocaleDateString(),
        day.total_visitors,
      ]),
      startY: doc.previousAutoTable.finalY + 10,
    });

    // Save the PDF
    doc.save(`${selectedStore}-performance-report.pdf`);
  };

  if (loading) return <div>Loading...</div>;

  // Render the component
  return (
    <div className="storeWiseDiv">
      <div className="stats-grid">
        <div>
          <h6>Total Visitors:</h6> {stats.totalVisitors?.toLocaleString() || "N/A"}
        </div>
        <div>
          <h6>Total Visitors Last Month:</h6>{" "}
          {stats.totalVisitorsLastMonth?.toLocaleString() || "N/A"}
        </div>
        <div>
          <h6>Total Visitors This Month:</h6>{" "}
          {stats.totalVisitorsThisMonth?.toLocaleString() || "N/A"}
        </div>
        <div>
          <h6>Total Visitors Till Date:</h6>{" "}
          {stats.totalVisitorsTillDate?.toLocaleString() || "N/A"}
        </div>
        <div>
          <h6>Best Performing Day:</h6> {stats.bestPerformingDay}
        </div>
        <div>
          <h6>Best Performing Hour:</h6> {stats.bestPerformingHour}
        </div>
        <div>
          <h6>Maximum Visited Day:</h6>{" "}
          {stats.maxVisitedDay !== "N/A"
            ? new Intl.DateTimeFormat("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }).format(new Date(stats.maxVisitedDay))
            : "N/A"}
        </div>
        <div>
          <h6>Store Performance Compared to Last Month:</h6>{" "}
          {typeof stats.storePerformanceComparedToLastMonth === "number"
            ? `${stats.storePerformanceComparedToLastMonth.toFixed(2)}%`
            : stats.storePerformanceComparedToLastMonth || "N/A"}
        </div>
        <div>
          <h6>Store Performance Compared to Last Hour:</h6>{" "}
          {typeof stats.storePerformanceComparedToLastHour === "number"
            ? `${stats.storePerformanceComparedToLastHour.toFixed(2)}%`
            : stats.storePerformanceComparedToLastHour || "N/A"}
        </div>
        <div>
          <h6>Store Performance Compared to Last Week:</h6>{" "}
          {typeof stats.storePerformanceComparedToLastWeek === "number"
            ? `${stats.storePerformanceComparedToLastWeek.toFixed(2)}%`
            : stats.storePerformanceComparedToLastWeek || "N/A"}
        </div>
        <div>
          <h6>Comparison Between Today & Yesterday:</h6>{" "}
          {typeof stats.comparisonTodayYesterday === "number"
            ? `${stats.comparisonTodayYesterday.toFixed(2)}%`
            : stats.comparisonTodayYesterday || "N/A"}
        </div>
      </div>
      <h3>Top 10 Best Performing Days:</h3>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Date</th>
            <th>Visitors</th>
          </tr>
        </thead>
        <tbody>
          {stats.topDays.map((day, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{new Date(day.day).toLocaleDateString()}</td>
              <td>{day.total_visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={generatePDFReport}>Generate PDF Report</button>
    </div>
  );
};

export default StoreWise;
