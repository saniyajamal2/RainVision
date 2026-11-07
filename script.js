// ============================================
// RainVision - script.js
// Data loading, searching, sorting and averages.
// ============================================

// ARRAY of all rainfall records (each item is one object)
let rainfallRecords = [];

// ARRAY of unique subdivision names (in the order of the CSV)
let subdivisionNames = [];

// ARRAY of the same names, sorted A to Z
let sortedSubdivisionNames = [];

// ARRAY of objects: one object per subdivision with its average
let subdivisionAverages = [];

// Counts the comparisons made by Merge Sort
let mergeSortComparisons = 0;


// Function 1: toNumber
// Converts CSV text into a number.
// "NA" or empty text means missing data, so we return null.
function toNumber(text) {
  if (text === "NA" || text === "") {
    return null;
  }
  return Number(text);
}


// Function 2: parseCSV
// Takes the full CSV text and returns an array of objects.
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const records = [];

  // Start at 1 to skip the header line
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(",");

    // Collect the 12 monthly values (JAN to DEC)
    const monthly = [];
    for (let j = 0; j < 12; j++) {
      monthly.push(toNumber(parts[2 + j]));
    }

    // One OBJECT for one row
    const record = {
      subdivision: parts[0],
      year: Number(parts[1]),
      monthly: monthly,
      annual: toNumber(parts[14]),
      jf: toNumber(parts[15]),
      mam: toNumber(parts[16]),
      jjas: toNumber(parts[17]),
      ond: toNumber(parts[18])
    };

    records.push(record);
  }

  return records;
}


// Function 3: showValue
// If a value is missing (null), show "No data". Otherwise show the value.
function showValue(value) {
  if (value === null) {
    return "No data";
  }
  return value;
}


// Function 4: showFirstTenRecords
// Fills the table with the first 10 records of the array.
function showFirstTenRecords() {
  const tableBody = document.getElementById("records-table-body");

  for (let i = 0; i < 10; i++) {
    const record = rainfallRecords[i];
    const row = document.createElement("tr");

    row.innerHTML =
      "<td>" + record.subdivision + "</td>" +
      "<td>" + record.year + "</td>" +
      "<td>" + showValue(record.annual) + "</td>" +
      "<td>" + showValue(record.jjas) + "</td>";

    tableBody.appendChild(row);
  }
}


// Function 5: isNameInList
// Checks whether a name is already inside a list of names.
function isNameInList(list, name) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === name) {
      return true;
    }
  }
  return false;
}


// Function 6: buildSubdivisionNames
// Goes through all records and collects each subdivision name only once.
function buildSubdivisionNames() {
  const names = [];

  for (let i = 0; i < rainfallRecords.length; i++) {
    const name = rainfallRecords[i].subdivision;

    if (isNameInList(names, name) === false) {
      names.push(name);
    }
  }

  return names;
}


// Function 7: linearSearch
// MY OWN implementation of Linear Search.
// It checks the items one by one from the start.
// It returns an object with two things:
//   position    -> index where the name was found (-1 if not found)
//   comparisons -> how many items we checked
function linearSearch(list, target) {
  let comparisons = 0;

  for (let i = 0; i < list.length; i++) {
    comparisons = comparisons + 1;

    if (list[i].toLowerCase() === target.toLowerCase()) {
      return { position: i, comparisons: comparisons };
    }
  }

  // We reached the end without finding the name
  return { position: -1, comparisons: comparisons };
}


// Function 8: countRecordsOf
// Counts how many records belong to one subdivision.
function countRecordsOf(name) {
  let count = 0;

  for (let i = 0; i < rainfallRecords.length; i++) {
    if (rainfallRecords[i].subdivision === name) {
      count = count + 1;
    }
  }

  return count;
}


// Function 9: handleLinearSearch
// Runs when the "Linear Search" button is clicked.
function handleLinearSearch() {
  const typedText = document.getElementById("search-input").value.trim();
  const resultBox = document.getElementById("search-result");

  // If the box is empty, ask the user to type something
  if (typedText === "") {
    resultBox.textContent = "Please type a subdivision name first.";
    return;
  }

  const result = linearSearch(subdivisionNames, typedText);

  if (result.position === -1) {
    resultBox.textContent =
      "Linear Search: \"" + typedText + "\" was NOT found. " +
      "Comparisons made: " + result.comparisons;
  } else {
    const foundName = subdivisionNames[result.position];
    resultBox.textContent =
      "Linear Search: FOUND \"" + foundName + "\" at position " +
      result.position + ". Comparisons made: " + result.comparisons +
      ". Records for this subdivision: " + countRecordsOf(foundName);
  }
}


// Function 10: insertionSort
// MY OWN implementation of Insertion Sort.
// It sorts a list of names from A to Z.
// It works on a COPY, so the original list stays unchanged.
function insertionSort(list) {
  // Make a copy of the list
  const sorted = list.slice();

  // Item 0 is already "sorted" by itself, so we start at 1
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];   // the item we want to insert
    let j = i - 1;               // start checking just left of it

    // Move bigger items one step to the right
    while (j >= 0 && sorted[j].toLowerCase() > current.toLowerCase()) {
      sorted[j + 1] = sorted[j];
      j = j - 1;
    }

    // Put the item in its correct place
    sorted[j + 1] = current;
  }

  return sorted;
}


// Function 11: binarySearch
// MY OWN implementation of Binary Search.
// IMPORTANT: the list MUST already be sorted A to Z.
// It returns an object with two things:
//   position    -> index where the name was found (-1 if not found)
//   comparisons -> how many middle items we checked
function binarySearch(sortedList, target) {
  let low = 0;                         // left end of the search area
  let high = sortedList.length - 1;    // right end of the search area
  let comparisons = 0;
  const targetLower = target.toLowerCase();

  // Keep going while there is still something left to search
  while (low <= high) {
    // Find the middle position
    const middle = Math.floor((low + high) / 2);
    const middleName = sortedList[middle].toLowerCase();

    comparisons = comparisons + 1;

    if (middleName === targetLower) {
      // Found it
      return { position: middle, comparisons: comparisons };
    } else if (targetLower < middleName) {
      // Target comes BEFORE the middle: keep only the left half
      high = middle - 1;
    } else {
      // Target comes AFTER the middle: keep only the right half
      low = middle + 1;
    }
  }

  // The search area became empty, so the name is not in the list
  return { position: -1, comparisons: comparisons };
}


// Function 12: handleBinarySearch
// Runs when the "Binary Search" button is clicked.
function handleBinarySearch() {
  const typedText = document.getElementById("search-input").value.trim();
  const resultBox = document.getElementById("binary-search-result");

  // If the box is empty, ask the user to type something
  if (typedText === "") {
    resultBox.textContent = "Please type a subdivision name first.";
    return;
  }

  // Binary Search uses the SORTED list
  const result = binarySearch(sortedSubdivisionNames, typedText);

  if (result.position === -1) {
    resultBox.textContent =
      "Binary Search: \"" + typedText + "\" was NOT found. " +
      "Comparisons made: " + result.comparisons;
  } else {
    const foundName = sortedSubdivisionNames[result.position];
    resultBox.textContent =
      "Binary Search: FOUND \"" + foundName + "\" at position " +
      result.position + " (in the sorted list). Comparisons made: " +
      result.comparisons + ". Records for this subdivision: " +
      countRecordsOf(foundName);
  }
}


// Function 13: calculateAverageAnnual
// Calculates the average annual rainfall of ONE subdivision.
// Missing values (null) are skipped. They are NOT counted as zero.
// Returns an object: { name, average, count }
function calculateAverageAnnual(name) {
  let total = 0;   // running sum of annual rainfall
  let count = 0;   // how many years had a real value

  for (let i = 0; i < rainfallRecords.length; i++) {
    const record = rainfallRecords[i];

    if (record.subdivision === name && record.annual !== null) {
      total = total + record.annual;
      count = count + 1;
    }
  }

  let average = null;
  if (count > 0) {
    average = total / count;
  }

  return { name: name, average: average, count: count };
}


// Function 14: buildSubdivisionAverages
// Makes one average object for every subdivision.
function buildSubdivisionAverages() {
  const result = [];

  for (let i = 0; i < subdivisionNames.length; i++) {
    result.push(calculateAverageAnnual(subdivisionNames[i]));
  }

  return result;
}


// Function 15: showAveragesTable
// Fills the averages table on the page.
function showAveragesTable() {
  const tableBody = document.getElementById("averages-table-body");

  for (let i = 0; i < subdivisionAverages.length; i++) {
    const item = subdivisionAverages[i];
    const row = document.createElement("tr");

    row.innerHTML =
      "<td>" + item.name + "</td>" +
      "<td>" + item.average.toFixed(1) + "</td>" +
      "<td>" + item.count + "</td>";

    tableBody.appendChild(row);
  }
}


// Function 16: merge
// MERGES two lists that are ALREADY sorted into one sorted list.
// highestFirst = true  -> biggest average comes first
// highestFirst = false -> smallest average comes first
function merge(leftList, rightList, highestFirst) {
  const result = [];
  let i = 0;   // current position in the left list
  let j = 0;   // current position in the right list

  // Compare the front items of both lists, take the winner
  while (i < leftList.length && j < rightList.length) {
    mergeSortComparisons = mergeSortComparisons + 1;

    let takeLeft;
    if (highestFirst) {
      takeLeft = leftList[i].average >= rightList[j].average;
    } else {
      takeLeft = leftList[i].average <= rightList[j].average;
    }

    if (takeLeft) {
      result.push(leftList[i]);
      i = i + 1;
    } else {
      result.push(rightList[j]);
      j = j + 1;
    }
  }

  // One list is finished. Copy whatever is left of the other list.
  while (i < leftList.length) {
    result.push(leftList[i]);
    i = i + 1;
  }
  while (j < rightList.length) {
    result.push(rightList[j]);
    j = j + 1;
  }

  return result;
}


// Function 17: mergeSort
// MY OWN implementation of Merge Sort (divide and conquer).
// It sorts a list of objects by their "average" property.
function mergeSort(list, highestFirst) {
  // A list with 0 or 1 item is already sorted
  if (list.length <= 1) {
    return list;
  }

  // DIVIDE: split the list into two halves
  const middle = Math.floor(list.length / 2);
  const leftHalf = list.slice(0, middle);
  const rightHalf = list.slice(middle);

  // Sort each half (the function calls itself)
  const sortedLeft = mergeSort(leftHalf, highestFirst);
  const sortedRight = mergeSort(rightHalf, highestFirst);

  // CONQUER: merge the two sorted halves
  return merge(sortedLeft, sortedRight, highestFirst);
}


// Function 18: showRankingTable
// Shows a ranked list in the ranking table.
function showRankingTable(rankedList) {
  const tableBody = document.getElementById("ranking-table-body");

  // Remove the old rows first
  tableBody.innerHTML = "";

  for (let i = 0; i < rankedList.length; i++) {
    const item = rankedList[i];
    const row = document.createElement("tr");

    row.innerHTML =
      "<td>" + (i + 1) + "</td>" +
      "<td>" + item.name + "</td>" +
      "<td>" + item.average.toFixed(1) + "</td>";

    tableBody.appendChild(row);
  }
}


// Function 19: handleMergeSort
// Runs Merge Sort and shows the result.
function handleMergeSort(highestFirst) {
  // Reset the counter before sorting
  mergeSortComparisons = 0;

  const rankedList = mergeSort(subdivisionAverages, highestFirst);

  showRankingTable(rankedList);

  let direction = "Lowest to Highest";
  if (highestFirst) {
    direction = "Highest to Lowest";
  }

  document.getElementById("merge-sort-info").textContent =
    "Merge Sort (" + direction + ") sorted " + rankedList.length +
    " subdivisions. Comparisons made: " + mergeSortComparisons;
}


// Function 20: handleHighToLow
function handleHighToLow() {
  handleMergeSort(true);
}


// Function 21: handleLowToHigh
function handleLowToHigh() {
  handleMergeSort(false);
}


// Function 22: loadData
// Reads the CSV file, builds the arrays, and shows the result.
async function loadData() {
  const response = await fetch("data/Sub_Division_IMD_2017.csv");
  const csvText = await response.text();

  rainfallRecords = parseCSV(csvText);
  subdivisionNames = buildSubdivisionNames();

  // Sort the names A to Z using Insertion Sort
  sortedSubdivisionNames = insertionSort(subdivisionNames);

  // Calculate the average annual rainfall of every subdivision
  subdivisionAverages = buildSubdivisionAverages();

  console.log("Total records:", rainfallRecords.length);

  document.getElementById("record-count").textContent =
    "Records loaded: " + rainfallRecords.length +
    " | Unique subdivisions: " + subdivisionNames.length;

  showDashboard();        // from dashboard.js
  showMonthlyChart();     // from dashboard.js
  showMonsoonAnalysis();  // from monsoon.js  (NEW LINE)
  showFirstTenRecords();
  showAveragesTable();
}


// Connect the buttons to their functions
document.getElementById("linear-search-button")
  .addEventListener("click", handleLinearSearch);

document.getElementById("binary-search-button")
  .addEventListener("click", handleBinarySearch);

document.getElementById("merge-high-button")
  .addEventListener("click", handleHighToLow);

document.getElementById("merge-low-button")
  .addEventListener("click", handleLowToHigh);

// Start everything
loadData();