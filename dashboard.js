// ============================================
// RainVision - dashboard.js
// Dashboard cards, monthly chart and yearly trend chart.
// It uses the arrays created in script.js.
// ============================================

// ARRAY with the 12 month names
const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];


// Function 1: calculateDashboardStats
// Goes through ALL records ONCE and finds:
//   the average annual rainfall, the highest record, the lowest record,
//   and the first and last year.
// Records with a missing annual value are skipped.
function calculateDashboardStats() {
  let total = 0;
  let count = 0;
  let highestRecord = null;
  let lowestRecord = null;
  let firstYear = rainfallRecords[0].year;
  let lastYear = rainfallRecords[0].year;

  for (let i = 0; i < rainfallRecords.length; i++) {
    const record = rainfallRecords[i];

    // Track the first and last year (years are never missing)
    if (record.year < firstYear) {
      firstYear = record.year;
    }
    if (record.year > lastYear) {
      lastYear = record.year;
    }

    // Skip records with missing annual rainfall
    if (record.annual === null) {
      continue;
    }

    total = total + record.annual;
    count = count + 1;

    // Is this the highest so far?
    if (highestRecord === null || record.annual > highestRecord.annual) {
      highestRecord = record;
    }

    // Is this the lowest so far?
    if (lowestRecord === null || record.annual < lowestRecord.annual) {
      lowestRecord = record;
    }
  }

  return {
    average: total / count,
    count: count,
    highest: highestRecord,
    lowest: lowestRecord,
    firstYear: firstYear,
    lastYear: lastYear
  };
}


// Function 2: showDashboard
// Writes the calculated statistics into the five cards.
// It also draws the yearly trend chart.
function showDashboard() {
  const stats = calculateDashboardStats();

  document.getElementById("stat-subdivisions").textContent =
    subdivisionNames.length;

  document.getElementById("stat-years").textContent =
    stats.firstYear + " to " + stats.lastYear;

  document.getElementById("stat-average").textContent =
    stats.average.toFixed(1) + " mm";

  document.getElementById("stat-highest").textContent =
    stats.highest.annual + " mm";
  document.getElementById("stat-highest-note").textContent =
    stats.highest.subdivision + ", " + stats.highest.year;

  document.getElementById("stat-lowest").textContent =
    stats.lowest.annual + " mm";
  document.getElementById("stat-lowest-note").textContent =
    stats.lowest.subdivision + ", " + stats.lowest.year;

  // Draw the yearly trend chart (uses the first and last year found above)
  showTrendChart(stats.firstYear, stats.lastYear);
}


// Function 3: calculateMonthlyAverages
// Finds the average rainfall of each month (Jan to Dec)
// using ALL records. Missing values (null) are skipped.
// Returns an array of 12 numbers.
function calculateMonthlyAverages() {
  // Two arrays of 12 zeros: one for totals, one for counts
  const monthTotals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const monthCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < rainfallRecords.length; i++) {
    const record = rainfallRecords[i];

    for (let m = 0; m < 12; m++) {
      if (record.monthly[m] !== null) {
        monthTotals[m] = monthTotals[m] + record.monthly[m];
        monthCounts[m] = monthCounts[m] + 1;
      }
    }
  }

  // Divide each total by its count to get the averages
  const averages = [];
  for (let m = 0; m < 12; m++) {
    averages.push(monthTotals[m] / monthCounts[m]);
  }

  return averages;
}


// Function 4: showMonthlyChart
// Draws a bar chart of the 12 monthly averages using Chart.js.
function showMonthlyChart() {
  const averages = calculateMonthlyAverages();

  // Round each value to 1 decimal place for display
  const roundedAverages = [];
  for (let m = 0; m < 12; m++) {
    roundedAverages.push(Math.round(averages[m] * 10) / 10);
  }

  console.log("Monthly averages:", roundedAverages);

  const canvas = document.getElementById("monthly-chart");

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: monthNames,
      datasets: [{
        label: "Average rainfall (mm)",
        data: roundedAverages,
        backgroundColor: "#0b7285"
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Rainfall (mm)" }
        }
      }
    }
  });
}


// Function 5: calculateYearlyAverages  (NEW)
// Finds the average annual rainfall for EACH YEAR (all subdivisions together).
// A record's position in the arrays is: year - firstYear
// Example: 1901 -> position 0, 1902 -> position 1, ...
// Returns an array with one average per year.
function calculateYearlyAverages(firstYear, lastYear) {
  const numberOfYears = lastYear - firstYear + 1;

  // Two arrays: one total and one count for every year
  const yearTotals = [];
  const yearCounts = [];
  for (let y = 0; y < numberOfYears; y++) {
    yearTotals.push(0);
    yearCounts.push(0);
  }

  for (let i = 0; i < rainfallRecords.length; i++) {
    const record = rainfallRecords[i];

    // Skip records with missing annual rainfall
    if (record.annual === null) {
      continue;
    }

    // Array indexing: go directly to this year's position
    const position = record.year - firstYear;
    yearTotals[position] = yearTotals[position] + record.annual;
    yearCounts[position] = yearCounts[position] + 1;
  }

  // Divide each total by its count
  const averages = [];
  for (let y = 0; y < numberOfYears; y++) {
    averages.push(yearTotals[y] / yearCounts[y]);
  }

  return averages;
}


// Function 6: showTrendChart  (NEW)
// Draws a line chart of the yearly average annual rainfall using Chart.js.
function showTrendChart(firstYear, lastYear) {
  const averages = calculateYearlyAverages(firstYear, lastYear);

  // Make the list of year labels and rounded values
  const yearLabels = [];
  const roundedAverages = [];
  for (let y = 0; y < averages.length; y++) {
    yearLabels.push(firstYear + y);
    roundedAverages.push(Math.round(averages[y] * 10) / 10);
  }

  console.log("Yearly averages:", roundedAverages);

  const canvas = document.getElementById("trend-chart");

  new Chart(canvas, {
    type: "line",
    data: {
      labels: yearLabels,
      datasets: [{
        label: "Average annual rainfall (mm)",
        data: roundedAverages,
        borderColor: "#0b7285",
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { maxTicksLimit: 12 }
        },
        y: {
          title: { display: true, text: "Rainfall (mm)" }
        }
      }
    }
  });
}