export const minifyNumber = (num: number | null) => {
  if (!num) {
    return null;
  }

  if (num < 1000) {
    return num.toFixed(2);
  }

  const units = ['K', 'M', 'B', 'T'];
  let unitIndex = -1;
  let reducedNum = num;

  while (reducedNum >= 1000 && unitIndex < units.length - 1) {
    reducedNum /= 1000;
    unitIndex++;
  }

  return Math.round(reducedNum * 10) / 10 + units[unitIndex];
};

export const formatTime = (time: string) => {
  if (!time) return '';

  // If hour is one number, add a 0 in front
  const hour = time.split('  ')[1].split(' ')[0].split(':')[0];
  const minute = time.split('  ')[1].split(' ')[0].split(':')[1];
  const ampm = time.split('  ')[1].split(' ')[1];

  if (hour.length === 1) {
    return '0' + hour + ':' + minute + ' ' + ampm;
  }

  return hour + ':' + minute + ' ' + ampm;
};