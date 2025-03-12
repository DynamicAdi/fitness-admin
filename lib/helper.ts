export function formatTime(dateOrString: Date | string): string {
  const date = dateOrString instanceof Date ? dateOrString : new Date(dateOrString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}