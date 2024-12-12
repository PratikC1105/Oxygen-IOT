// utils.js
function formatDateTime(sqlDateTime) {
  const date = new Date(sqlDateTime);

  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return {
    formattedDate: `${mm}-${dd}-${yyyy}`,
    formattedTime: `${hh}-${min}`,
  };
}

module.exports = { formatDateTime };
