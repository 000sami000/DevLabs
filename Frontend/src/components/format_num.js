export function formatNumber(num) {
    if (num < 1000) {
        return num.toString();
    } else if (num < 10000) {
        return (num / 1000).toFixed(1) + 'k';
    } else if (num < 1000000) {
        return Math.floor(num / 1000) + 'k';
    } else {
        return (num / 1000000).toFixed(1) + 'M';
    }
}
