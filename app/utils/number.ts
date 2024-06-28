export const minifyNumber = (num: number | null) => {
    if (!num) {
        return null;
    }
    
    if (num < 1000) {
        return num.toString();
    }

    const units = ['K', 'M', 'B', 'T'];
    let unitIndex = -1;
    let reducedNum = num;

    while(reducedNum >= 1000 && unitIndex < units.length - 1) {
        reducedNum /= 1000;
        unitIndex++;
    }

    return Math.round(reducedNum) + units[unitIndex];
}