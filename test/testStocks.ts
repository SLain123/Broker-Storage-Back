import { IStockData } from '../utils/getDeltaCount';

export const onlyBuy: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 5, action: 'buy' },
    { count: 20, pricePerSingle: 500, fee: 5, action: 'buy' },
    { count: 50, pricePerSingle: 1500, fee: 40, action: 'buy' },
    { count: 10, pricePerSingle: 500, fee: 5, action: 'buy' },
    { count: 10, pricePerSingle: 500, fee: 10, action: 'buy' },
    { count: 50, pricePerSingle: 750, fee: 50, action: 'buy' },
];

export const allSold: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 10, action: 'buy' },
    { count: 20, pricePerSingle: 5000, fee: 50, action: 'buy' },
    { count: 50, pricePerSingle: 1500, fee: 40, action: 'buy' },
    { count: 100, pricePerSingle: 500, fee: 1, action: 'buy' },
    { count: 140, pricePerSingle: 500, fee: 50, action: 'sell' },
    { count: 40, pricePerSingle: 500, fee: 60, action: 'sell' },
];

export const firstRightMix: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 20, pricePerSingle: 500, fee: 1, action: 'buy' },
    { count: 10, pricePerSingle: 1500, fee: 1, action: 'sell' },
    { count: 5, pricePerSingle: 1500, fee: 2, action: 'sell' },
    { count: 5, pricePerSingle: 500, fee: 10, action: 'buy' },
    { count: 8, pricePerSingle: 500, fee: 20, action: 'buy' },
    { count: 10, pricePerSingle: 1500, fee: 10, action: 'sell' },
    { count: 10, pricePerSingle: 1500, fee: 15, action: 'sell' },
    { count: 50, pricePerSingle: 500, fee: 50, action: 'buy' },
    { count: 50, pricePerSingle: 500, fee: 10, action: 'buy' },
    { count: 5, pricePerSingle: 500, fee: 0, action: 'sell' },
];

export const secondRightMix: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 10, pricePerSingle: 1500, fee: 1, action: 'sell' },
    { count: 5, pricePerSingle: 500, fee: 10, action: 'buy' },
    { count: 5, pricePerSingle: 1500, fee: 10, action: 'sell' },
    { count: 50, pricePerSingle: 500, fee: 50, action: 'buy' },
    { count: 50, pricePerSingle: 500, fee: 10, action: 'sell' },
    { count: 5, pricePerSingle: 500, fee: 0, action: 'buy' },
];

export const thirdRightMix: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 70, pricePerSingle: 1000, fee: 3, action: 'sell' },
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
];

export const fourthRightMix: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 100, action: 'buy' },
    { count: 20, pricePerSingle: 500, fee: 100, action: 'buy' },
    { count: 30, pricePerSingle: 1500, fee: 200, action: 'sell' },
    { count: 10, pricePerSingle: 1000, fee: 0, action: 'buy' },
    { count: 5, pricePerSingle: 200, fee: 0, action: 'sell' },
    { count: 10, pricePerSingle: 1000, fee: 0, action: 'buy' },
    { count: 5, pricePerSingle: 2000, fee: 0, action: 'sell' },
    { count: 10, pricePerSingle: 200, fee: 0, action: 'sell' },
];

export const veryGoodProfite: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 20, pricePerSingle: 1005, fee: 4, action: 'buy' },
    { count: 30, pricePerSingle: 1010, fee: 5, action: 'buy' },
    { count: 40, pricePerSingle: 1015, fee: 6, action: 'buy' },
    { count: 50, pricePerSingle: 1020, fee: 7, action: 'buy' },
    { count: 60, pricePerSingle: 1025, fee: 8, action: 'buy' },
    { count: 70, pricePerSingle: 1030, fee: 9, action: 'buy' },
    { count: 80, pricePerSingle: 1035, fee: 10, action: 'buy' },
    { count: 350, pricePerSingle: 5000, fee: 300, action: 'sell' },
    { count: 10, pricePerSingle: 500, fee: 1, action: 'buy' },
];

export const maxSellActions: IStockData[] = [
    { count: 1000, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 200, pricePerSingle: 1005, fee: 4, action: 'sell' },
    { count: 50, pricePerSingle: 1010, fee: 5, action: 'sell' },
    { count: 40, pricePerSingle: 1015, fee: 6, action: 'sell' },
    { count: 60, pricePerSingle: 1020, fee: 7, action: 'sell' },
    { count: 100, pricePerSingle: 1025, fee: 8, action: 'sell' },
    { count: 50, pricePerSingle: 1030, fee: 9, action: 'sell' },
    { count: 250, pricePerSingle: 1100, fee: 10, action: 'sell' },
    { count: 150, pricePerSingle: 3000, fee: 100, action: 'sell' },
];

export const negativeProfite: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 20, pricePerSingle: 1005, fee: 4, action: 'buy' },
    { count: 30, pricePerSingle: 1010, fee: 5, action: 'buy' },
    { count: 40, pricePerSingle: 1015, fee: 6, action: 'buy' },
    { count: 50, pricePerSingle: 1020, fee: 7, action: 'buy' },
    { count: 60, pricePerSingle: 1025, fee: 8, action: 'buy' },
    { count: 70, pricePerSingle: 1030, fee: 9, action: 'buy' },
    { count: 80, pricePerSingle: 1035, fee: 10, action: 'buy' },
    { count: 350, pricePerSingle: 500, fee: 300, action: 'sell' },
    { count: 10, pricePerSingle: 450, fee: 200, action: 'sell' },
    { count: 10, pricePerSingle: 500, fee: 1, action: 'buy' },
    { count: 10, pricePerSingle: 1500, fee: 5, action: 'buy' },
];

export const sellBeforeBuy: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'sell' },
    { count: 20, pricePerSingle: 1005, fee: 4, action: 'buy' },
];

export const sellCountGreaterBuyCount: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 20, pricePerSingle: 1005, fee: 4, action: 'sell' },
    { count: 20, pricePerSingle: 1005, fee: 4, action: 'buy' },
];

export const allSoldWithProfite: IStockData[] = [
    { count: 10, pricePerSingle: 1000, fee: 3, action: 'buy' },
    { count: 20, pricePerSingle: 500, fee: 1, action: 'buy' },
    { count: 10, pricePerSingle: 1500, fee: 1, action: 'sell' },
    { count: 5, pricePerSingle: 1500, fee: 2, action: 'sell' },
    { count: 5, pricePerSingle: 500, fee: 10, action: 'buy' },
    { count: 8, pricePerSingle: 500, fee: 20, action: 'buy' },
    { count: 10, pricePerSingle: 1500, fee: 10, action: 'sell' },
    { count: 10, pricePerSingle: 1500, fee: 15, action: 'sell' },
    { count: 50, pricePerSingle: 500, fee: 50, action: 'buy' },
    { count: 50, pricePerSingle: 500, fee: 10, action: 'buy' },
    { count: 5, pricePerSingle: 500, fee: 0, action: 'sell' },
    { count: 103, pricePerSingle: 500, fee: 0, action: 'sell' },
];
