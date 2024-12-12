const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { formatDateTime } = require("../util");

// API to fetch hourly data
router.get("/hourly-data", (req, res) => {
  const { storeID, startDate, endDate } = req.query;
  const query = `
    SELECT date, hr_enter_count, hr_exit_count
    FROM store_pc
    WHERE storeID = ?
    AND date BETWEEN ? AND ?
    ORDER BY date ASC;
  `;
  db.query(query, [storeID, startDate, endDate], (err, results) => {
    if (err) {
      console.error("SQL Error in /hourly-data:", err);
      res.status(500).send("Server Error");
    } else {
      const formattedResults = results.map((row) => ({
        ...row,
        date: row.date, // Keep the full timestamp
      }));
      
      res.json(formattedResults);
    }
  });
});
router.get("/daily-totals", (req, res) => {
  const { storeID } = req.query;
  const query = `
    SELECT date, COALESCE(today_enter_count, 0) AS today_enter_count, COALESCE(today_exit_count, 0) AS today_exit_count
    FROM store_pc 
    WHERE storeID = ?
    ORDER BY date DESC;
  `;
  db.query(query, [storeID], (err, results) => {
    if (err) {
      console.error("SQL Error in /daily-totals:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(results);
    }
  });
});

// API to fetch peak hours
router.get("/peak-hours", (req, res) => {
  const { storeID } = req.query;
  const query = `
    SELECT HOUR(date) AS hour, SUM(hr_enter_count) AS total_enter, SUM(hr_exit_count) AS total_exit 
    FROM store_pc 
    WHERE storeID = ? AND type = 'Hour'
    GROUP BY HOUR(date)
    ORDER BY total_enter DESC
    LIMIT 1;
  `;
  db.query(query, [storeID], (err, results) => {
    if (err) {
      console.error("SQL Error in /peak-hours:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(results[0]);
    }
  });
});
router.get("/peak-hour", (req, res) => {
  const { storeID, startDate, endDate } = req.query;
  const query = `
      SELECT 
          HOUR(date) AS hour, 
          SUM(hr_enter_count) AS total_visitors
      FROM store_pc
      WHERE storeID = ? AND date BETWEEN ? AND ?
      GROUP BY HOUR(date)
      ORDER BY total_visitors DESC
      LIMIT 1;
  `;
  db.query(query, [storeID, startDate, endDate], (err, results) => {
    if (err) {
      console.error("SQL Error in /peak-hour:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(results[0] || {});
    }
  });
});

// API to fetch peak day
router.get("/peak-day", (req, res) => {
  const { storeID, startDate, endDate } = req.query;
  const query = `
    SELECT DATE(date) AS day, SUM(today_enter_count) AS total_enter, SUM(today_exit_count) AS total_exit
    FROM store_pc
    WHERE storeID = ? AND date BETWEEN ? AND ?
    GROUP BY DATE(date)
    ORDER BY total_enter DESC
    LIMIT 1;
  `;
  db.query(query, [storeID, startDate, endDate], (err, results) => {
    if (err) {
      console.error("SQL Error in /peak-day:", err);
      res.status(500).send("Server Error");
    } else {
      const formattedResults = results.map((row) => {
        const { formattedDate } = formatDateTime(row.day);
        return {
          ...row,
          day: formattedDate,
        };
      });
      res.json(formattedResults[0]);
    }
  });
});

// API to fetch live statistics
router.get("/live-stats", (req, res) => {
  const { storeID } = req.query;
  const query = `
    SELECT date, hr_enter_count, hr_exit_count, today_enter_count, today_exit_count, total_enter_count, total_exit_count
    FROM live_pc
    WHERE storeID = ?;
  `;
  db.query(query, [storeID], (err, results) => {
    if (err) {
      console.error("SQL Error in /live-stats:", err);
      res.status(500).send("Server Error");
    } else {
      const formattedResults = results.map((row) => {
        const { formattedDate, formattedTime } = formatDateTime(row.date);
        return {
          ...row,
          date: formattedDate,
          time: formattedTime,
        };
      });
      res.json(formattedResults[0] || {});
    }
  });
});

// API to fetch available stores
router.get("/stores", (req, res) => {
  const query = `
    SELECT DISTINCT storeID 
    FROM store_pc;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("SQL Error in /stores:", err);
      res.status(500).send("Server Error");
    } else {
      const stores = results.map((row) => row.storeID);
      res.json(stores);
    }
  });
});
router.get("/report", (req, res) => {
  const query = `
    SELECT storeID, MAX(total_enter_count) AS max_visitors
    FROM store_pc
    GROUP BY storeID
    ORDER BY max_visitors ASC
    LIMIT 10;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("SQL Error in /report:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(results);
    }
  });
});

router.get("/last-month-best-store", (req, res) => {
  const { startDate, endDate } = req.query;

  const query = `
    SELECT storeID, MAX(total_enter_count) AS max_visitors
    FROM store_pc
    WHERE date BETWEEN ? AND ?
    GROUP BY storeID
    ORDER BY max_visitors DESC
    LIMIT 1;
  `;

  db.query(query, [startDate, endDate], (err, results) => {
    if (err) {
      console.error("SQL Error in /last-month-best-store:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(results[0] || {});
    }
  });
});
router.get("/top-performing-days", (req, res) => {
  const { storeID, startDate, endDate } = req.query;

  // Default query for all-time top-performing days
  let query = `
    SELECT 
        DATE(date) AS day,
        SUM(today_enter_count) AS total_visitors
    FROM store_pc
    WHERE storeID = ?
    GROUP BY DATE(date)
    ORDER BY total_visitors DESC
    LIMIT 10;
  `;

  // Use date range if provided
  const queryParams = [storeID];
  if (startDate && endDate) {
    query = `
      SELECT 
          DATE(date) AS day,
          SUM(today_enter_count) AS total_visitors
      FROM store_pc
      WHERE storeID = ? AND date BETWEEN ? AND ?
      GROUP BY DATE(date)
      ORDER BY total_visitors DESC
      LIMIT 10;
    `;
    queryParams.push(startDate, endDate);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("SQL Error in /top-performing-days:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(results);
    }
  });
});

router.get("/monthly-data", (req, res) => {
  const { storeID, startDate, endDate } = req.query;
  const query = `
      SELECT 
          SUM(today_enter_count) AS total_visitors
      FROM store_pc
      WHERE storeID = ? AND date BETWEEN ? AND ?;
  `;
  db.query(query, [storeID, startDate, endDate], (err, results) => {
    if (err) {
      console.error("SQL Error in /monthly-data:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(results[0] || {});
    }
  });
});


// API for store locations
router.get("/store-locations", (req, res) => {
  const query = `
    SELECT DISTINCT geo_loc, storeID, location, COALESCE(total_enter_count, 0) AS total_enter_count
    FROM store_pc
    WHERE geo_loc IS NOT NULL AND geo_loc != '';
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("SQL Error in /store-locations:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(
        results.map((row) => ({
          geoLoc: row.geo_loc.trim(),
          storeID: row.storeID,
          location: row.location.trim().toLowerCase(),
          total_enter_count: row.total_enter_count,
        }))
      );
    }
  });
});

router.get("/store-locations", (req, res) => {
  const query = `
    SELECT DISTINCT geo_loc, storeID, location, COALESCE(total_enter_count, 0) AS total_enter_count
    FROM store_pc
    WHERE geo_loc IS NOT NULL AND geo_loc != '';
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("SQL Error in /store-locations:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(
        results.map((row) => ({
          geoLoc: row.geo_loc.trim(),
          storeID: row.storeID,
          location: row.location.trim().toLowerCase(),
          total_enter_count: row.total_enter_count,
        }))
      );
    }
  });
});

// API for predictive analytics
router.get("/predictive-analytics", (req, res) => {
  const { storeID, type } = req.query;
  let query = "";

  if (type === "daily") {
    query = `
      SELECT DATE(date) AS day, COALESCE(AVG(today_enter_count), 0) AS avg_enter
      FROM store_pc
      WHERE storeID = ?
      GROUP BY DATE(date)
      ORDER BY day DESC
      LIMIT 30;
    `;
  } else if (type === "hourly") {
    query = `
      SELECT HOUR(date) AS hour, COALESCE(AVG(hr_enter_count), 0) AS avg_enter
      FROM store_pc
      WHERE storeID = ?
      GROUP BY HOUR(date)
      ORDER BY hour ASC;
    `;
  }

  db.query(query, [storeID], (err, results) => {
    if (err) {
      console.error("SQL Error in /predictive-analytics:", err);
      res.status(500).send("Server Error");
    } else {
      const formattedResults = results.map((row) => ({
        ...row,
        avg_enter: parseFloat(row.avg_enter).toFixed(2),
      }));
      res.json(formattedResults);
    }
  });
});


// API for real-time alerts
router.get("/alerts", (req, res) => {
  const { storeID } = req.query;
  const query = `
    SELECT
      HOUR(date) AS hour,
      SUM(hr_enter_count) AS total_enter,
      SUM(hr_exit_count) AS total_exit
    FROM store_pc
    WHERE storeID = ? AND DATE(date) = CURDATE()
    GROUP BY HOUR(date)
    HAVING total_enter > 100 OR total_exit > 100; -- Set thresholds
  `;
  db.query(query, [storeID], (err, results) => {
    if (err) {
      console.error("SQL Error in /alerts:", err);
      res.status(500).send("Server Error");
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
