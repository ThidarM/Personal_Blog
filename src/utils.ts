/**
 * Formats a date string (YYYY-MM-DD) into a human-readable format (e.g., "August 7, 2024").
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    // If it's already a Date string or otherwise formatted, try to parse with native Date
    try {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
      }
    } catch {
      // ignore
    }
    return dateString;
  }
  
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthName = months[monthIndex] !== undefined ? months[monthIndex] : parts[1];
  return `${monthName} ${day}, ${year}`;
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
