export default function formatDate(dateString) {
  // Create a new Date object from the string
  const date = new Date(dateString);

  // Get day, month, and year from the date object
  const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits for day
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so we add 1
  const year = date.getFullYear(); // Get full year

  // Return the formatted date as dd/mm/yyyy
  return `${day}/${month}/${year}`;
}
