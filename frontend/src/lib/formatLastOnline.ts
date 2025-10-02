/**
 * Formats the last online timestamp into a user-friendly string
 * 
 * @param lastOnlineTime - Timestamp in milliseconds
 * @returns Formatted string like "Today at 12:30" or "28/07/2023 12:30"
 */
export function formatLastOnline(lastOnlineTime: number | undefined): string {
  if (!lastOnlineTime) return 'Unknown';
  
  const lastOnlineDate = new Date(lastOnlineTime);
  const now = new Date();
  
  // Format time as HH:MM
  const timeString = lastOnlineDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });  
  if (
    lastOnlineDate.getDate() === now.getDate() &&
    lastOnlineDate.getMonth() === now.getMonth() &&
    lastOnlineDate.getFullYear() === now.getFullYear()
  ) {
    return `Today at ${timeString}`;
  }  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    lastOnlineDate.getDate() === yesterday.getDate() &&
    lastOnlineDate.getMonth() === yesterday.getMonth() &&
    lastOnlineDate.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday at ${timeString}`;
  }
  
  // Otherwise, show full date
  const dateString = lastOnlineDate.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return `${dateString} ${timeString}`;
} 