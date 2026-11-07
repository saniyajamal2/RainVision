// ============================================
// RainVision - sortcompare.js
// Compares Insertion Sort and Merge Sort on the SAME data.
// It uses subdivisionAverages, mergeSort and mergeSortComparisons
// from script.js.
// ============================================


// Function 1: insertionSortByAverage
// MY OWN implementation of Insertion Sort for a list of objects.
// It sorts by the "average" property.
// highestFirst = true  -> biggest average comes first
// It also counts the comparisons.
// Returns an object: { sorted, comparisons }
function insertionSortByAverage(list, highestFirst) {
  // Work on a copy so the original list stays unchanged
  const sorted = list.slice();
  let comparisons = 0;

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    let j = i - 1;

    while (j >= 0) {
      comparisons = comparisons + 1;

      // Should sorted[j] move one step to the right?
      let shouldMove;
      if (highestFirst) {
        shouldMove = sorted[j].average < current.average;
      } else {
        shouldMove = sorted[j].average > current.average;
      }

      if (shouldMove) {
        sorted[j + 1] = sorted[j];
        j = j - 1;
      } else {
        break;   // the correct place is found, stop moving items
      }
    }

    sorted[j + 1] = current;
  }

  return { sorted: sorted, comparisons: comparisons };
}


// Function 2: handleCompareSorts
// Runs both algorithms on the same data (highest to lowest)
// and shows the comparison counts in a table.
function handleCompareSorts() {
  // Insertion Sort
  const insertionResult = insertionSortByAverage(subdivisionAverages, true);

  // Merge Sort (reset its counter first)
  mergeSortComparisons = 0;
  const mergeResult = mergeSort(subdivisionAverages, true);
  const mergeComparisons = mergeSortComparisons;

  // Check that both algorithms produced the SAME order
  let sameOrder = true;
  for (let i = 0; i < mergeResult.length; i++) {
    if (insertionResult.sorted[i].name !== mergeResult[i].name) {
      sameOrder = false;
    }
  }

  // Fill the table
  const tableBody = document.getElementById("compare-table-body");
  tableBody.innerHTML = "";

  tableBody.innerHTML =
    "<tr>" +
      "<td>Insertion Sort</td>" +
      "<td>" + insertionResult.comparisons + "</td>" +
      "<td>O(n&sup2;) in the worst case</td>" +
      "<td>O(1)</td>" +
    "</tr>" +
    "<tr>" +
      "<td>Merge Sort</td>" +
      "<td>" + mergeComparisons + "</td>" +
      "<td>O(n log n)</td>" +
      "<td>O(n)</td>" +
    "</tr>";

  let sameText = "No";
  if (sameOrder) {
    sameText = "Yes";
  }

  document.getElementById("compare-info").textContent =
    "Both algorithms sorted " + mergeResult.length +
    " subdivisions. Same final ranking: " + sameText;
}


// Connect the button to the function
document.getElementById("compare-sorts-button")
  .addEventListener("click", handleCompareSorts);