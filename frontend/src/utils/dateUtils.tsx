export function isBirthdayToday(date?: string | Date): boolean {
  if (!date) return false;

  const today = new Date();
  const birthDate = new Date(date);

  return (
    birthDate.getDate() === today.getDate() &&
    birthDate.getMonth() === today.getMonth()
  );
}