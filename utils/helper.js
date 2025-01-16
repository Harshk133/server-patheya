const aggregateByMonth = (documents, field) => {
    const result = {};
    documents.forEach(doc => {
      const month = new Date(doc[field]).toLocaleString("default", { month: "long" });
      result[month] = (result[month] || 0) + 1;
    });
  
    return {
      labels: Object.keys(result),
      datasets: [
        {
          label: "Count",
          data: Object.values(result),
          backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#f44336"]
        }
      ]
    };
  };
  
  module.exports = { aggregateByMonth };
  