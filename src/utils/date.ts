export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDisplayDate(date = new Date()): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
