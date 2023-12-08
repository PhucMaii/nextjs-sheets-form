export function calculateNextPos(currentPos: number, result: string[]) {
  const columns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (currentPos < columns.length) {
    return columns[currentPos];
  }
  result.unshift(columns[currentPos % columns.length]);
  currentPos = Math.floor(currentPos / columns.length) - 1;
  if (currentPos < columns.length) {
    result.unshift(columns[currentPos]);
    return result.join('');
  }
  return calculateNextPos(currentPos, result);
}
