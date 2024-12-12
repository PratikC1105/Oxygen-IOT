import React, { useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function LineChart({ data }) {
  useEffect(() => {
    const labels = data.map((d) =>
      new Date(d.date).toLocaleString([], {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    const duplicates = labels.filter((item, index) => labels.indexOf(item) !== index);
  }, [data]);
  const uniqueData = Array.from(new Map(data.map((d) => [d.date, d])).values());
  const labels = uniqueData.map((d) =>
    new Date(d.date).toLocaleString([], {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  const counts = uniqueData.map((d) => d.hr_enter_count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "People Entered",
        data: counts,
        borderColor: "#05589c",
        backgroundColor: "#82cdef61",
        fill: true,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 2.5,
        pointHoverRadius: 6,
        pointBackgroundColor: "#05589c",
        pointBorderColor: "#05589c",},
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
          font: {
            size: 10,
          },
        },
        grid: {
          color: "transparent",
        },
      },
      y: {
        ticks: {
          color: "white",
          font: {
            size: 10,
          },
        },
        grid: {
          color: "#cfd1d5",
        },
      },
    },
  };

  return (
    <div style={{ minWidth: "60vw", background: "#333333", borderRadius: "20px", margin: "50px 0" }}>
      <h4 style={{ color: "white" }}>Daily People Counter</h4>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default LineChart;