import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ data }) {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 6); // 7 days including today

  // Filter data to include only the last 7 days
  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    return date >= oneWeekAgo && date <= today;
  });

  // Aggregate data for each unique date
  const aggregatedData = filteredData.reduce((acc, curr) => {
    const dateKey = new Date(curr.date).toISOString().split("T")[0]; // Use date as the key
    if (!acc[dateKey]) {
      acc[dateKey] = 0;
    }
    acc[dateKey] += curr.hr_enter_count; // Sum up "entered" counts for each date
    return acc;
  }, {});

  const labels = Object.keys(aggregatedData); // Get unique dates
  const values = Object.values(aggregatedData); // Get corresponding total counts

  const backgroundColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#2E9AFE",
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors.slice(0, labels.length), // Ensure colors match the number of unique dates
        borderColor: "transparent", // No border for each pie slice
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "white", // Set legend labels to white for better visibility
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const day = tooltipItem.label;
            const value = tooltipItem.raw;
            return `${day}: ${value} entries`;
          },
        },
        bodyFont: {
          size: 12,
        },
      },
    },
  };

  return (
    <div style={{ width: "475px", background: "#333333", borderRadius: "20px" }}>
      <h4 style={{ color: "white" }}>Recent Weekly Analysis</h4>
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default PieChart;
