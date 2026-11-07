// ============================================
// RainVision - monsoon.js
// Compares the four seasonal columns: JF, MAM, JJAS, OND.
// It uses the rainfallRecords array created in script.js.
// ============================================


// Function 1: calculateSeasonAverages
// Finds the average rainfall of each season using ALL records.
// Missing values (null) are skipped.
// Returns an array of 4 objects (one per season).
function calculateSeasonAverages() {
  // One object per season. total and count start at 0.
  const seasons = [
    { name: "JF",   months: "Jan - Feb", total: 0, count: 0 },
    { name: "MAM",  months: "Mar - May", total: 0, count: 0 },
    { name: "JJAS", months: "Jun - Sep", total: 0, count: 0 },
    { name: "OND",  months: "Oct - Dec", total: 0, count: 0 }
  ];

  for (let i = 0; i < rainfallRecords.length; i++) {
    const record = rainfallRecords[i];

    // The 4 seasonal values of this record, in the same order as "seasons"
    const values = [record.jf, record.mam, record.jjas, record.ond];

    for (let s = 0; s < 4; s++) {
      if (values[s] !== null) {
        seasons[s].total = seasons[s].total + values[s];
        seasons[s].count = seasons[s].count + 1;
      }
    }
  }

  // Calculate the average of each season
  for (let s = 0; s < 4; s++) {
    seasons[s].average = seasons[s].total / seasons[s].count;
  }

  return seasons;
}


// Function 2: showMonsoonAnalysis
// Fills the season table and writes a short summary sentence.
function showMonsoonAnalysis() {
  const seasons = calculateSeasonAverages();

  // Add the four averages to find each season's share
  let sumOfAverages = 0;
  for (let s = 0; s < 4; s++) {
    sumOfAverages = sumOfAverages + seasons[s].average;
  }

  const tableBody = document.getElementById("season-table-body");

  for (let s = 0; s < 4; s++) {
    const share = (seasons[s].average / sumOfAverages) * 100;
    const row = document.createElement("tr");

    row.innerHTML =
      "<td>" + seasons[s].name + "</td>" +
      "<td>" + seasons[s].months + "</td>" +
      "<td>" + seasons[s].average.toFixed(1) + "</td>" +
      "<td>" + share.toFixed(1) + "%</td>";

    tableBody.appendChild(row);
  }

  // JJAS is at position 2 in the array
  const monsoonShare = (seasons[2].average / sumOfAverages) * 100;

  document.getElementById("monsoon-summary").textContent =
    "The monsoon season (JJAS) brings about " + monsoonShare.toFixed(1) +
    "% of the rainfall of the four seasons combined.";
}