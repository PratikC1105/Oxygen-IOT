import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ data }) {
  const chartData = {
    labels: data.map((d) => {
      const date = new Date(d.date);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: "People Entered",
        data: data.map((d) => d.hr_enter_count),
        backgroundColor: "#6e4fb0",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "white", // Set legend labels to #1C3342
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white", // Set x-axis labels to #1C3342
          font: {
            size: 10, // Adjust font size for x-axis
          },
        },
        grid: {
          color: "transparent", // Set x-axis gridlines to #1C3342 with some transparency
        },
      },
      y: {
        ticks: {
          color: "white", // Set y-axis labels to #1C3342
          font: {
            size: 10, // Adjust font size for y-axis
          },
        },
        grid: {
          color: "#cfd1d5", // Set y-axis gridlines to #1C3342 with some transparency
        },
      },
    },
  };

  return (
    <div style={{ minWidth: "60vw", background:"#333333", borderRadius:'20px' }}>
      <h4 style={{ color: "white" }}>Daily People Counter</h4>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default BarChart;
