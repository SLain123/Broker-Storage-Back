import { IStockData } from '../utils/getDeltaCount';

export const onlyBuy: IStockData[] = [
    { count: 10, single: 1000, fee: 5, action: 'buy' },
    { count: 20, single: 500, fee: 5, action: 'buy' },
    { count: 50, single: 1500, fee: 40, action: 'buy' },
    { count: 10, single: 500, fee: 5, action: 'buy' },
    { count: 10, single: 500, fee: 10, action: 'buy' },
    { count: 50, single: 750, fee: 50, action: 'buy' },
];

export const allSold: IStockData[] = [
    { count: 10, single: 1000, fee: 10, action: 'buy' },
    { count: 20, single: 5000, fee: 50, action: 'buy' },
    { count: 50, single: 1500, fee: 40, action: 'buy' },
    { count: 100, single: 500, fee: 1, action: 'buy' },
    { count: 140, single: 500, fee: 50, action: 'sell' },
    { count: 40, single: 500, fee: 60, action: 'sell' },
];

export const firstRightMix: IStockData[] = [
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 20, single: 500, fee: 1, action: 'buy' },
    { count: 10, single: 1500, fee: 1, action: 'sell' },
    { count: 5, single: 1500, fee: 2, action: 'sell' },
    { count: 5, single: 500, fee: 10, action: 'buy' },
    { count: 8, single: 500, fee: 20, action: 'buy' },
    { count: 10, single: 1500, fee: 10, action: 'sell' },
    { count: 10, single: 1500, fee: 15, action: 'sell' },
    { count: 50, single: 500, fee: 50, action: 'buy' },
    { count: 50, single: 500, fee: 10, action: 'buy' },
    { count: 5, single: 500, fee: 0, action: 'sell' },
];

export const secondRightMix: IStockData[] = [
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 10, single: 1500, fee: 1, action: 'sell' },
    { count: 5, single: 500, fee: 10, action: 'buy' },
    { count: 5, single: 1500, fee: 10, action: 'sell' },
    { count: 50, single: 500, fee: 50, action: 'buy' },
    { count: 50, single: 500, fee: 10, action: 'sell' },
    { count: 5, single: 500, fee: 0, action: 'buy' },
];

export const thirdRightMix: IStockData[] = [
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 70, single: 1000, fee: 3, action: 'sell' },
    { count: 10, single: 1000, fee: 3, action: 'buy' },
];

export const fourthRightMix: IStockData[] = [
    { count: 10, single: 1000, fee: 100, action: 'buy' },
    { count: 20, single: 500, fee: 100, action: 'buy' },
    { count: 30, single: 1500, fee: 200, action: 'sell' },
    { count: 10, single: 1000, fee: 0, action: 'buy' },
    { count: 5, single: 200, fee: 0, action: 'sell' },
    { count: 10, single: 1000, fee: 0, action: 'buy' },
    { count: 5, single: 2000, fee: 0, action: 'sell' },
    { count: 10, single: 200, fee: 0, action: 'sell' },
];

export const veryGoodProfite: IStockData[] = [
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 20, single: 1005, fee: 4, action: 'buy' },
    { count: 30, single: 1010, fee: 5, action: 'buy' },
    { count: 40, single: 1015, fee: 6, action: 'buy' },
    { count: 50, single: 1020, fee: 7, action: 'buy' },
    { count: 60, single: 1025, fee: 8, action: 'buy' },
    { count: 70, single: 1030, fee: 9, action: 'buy' },
    { count: 80, single: 1035, fee: 10, action: 'buy' },
    { count: 350, single: 5000, fee: 300, action: 'sell' },
    { count: 10, single: 500, fee: 1, action: 'buy' },
];

export const maxSellActions: IStockData[] = [
    { count: 1000, single: 1000, fee: 3, action: 'buy' },
    { count: 200, single: 1005, fee: 4, action: 'sell' },
    { count: 50, single: 1010, fee: 5, action: 'sell' },
    { count: 40, single: 1015, fee: 6, action: 'sell' },
    { count: 60, single: 1020, fee: 7, action: 'sell' },
    { count: 100, single: 1025, fee: 8, action: 'sell' },
    { count: 50, single: 1030, fee: 9, action: 'sell' },
    { count: 250, single: 1100, fee: 10, action: 'sell' },
    { count: 150, single: 3000, fee: 100, action: 'sell' },
];

export const negativeProfite: IStockData[] = [
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 20, single: 1005, fee: 4, action: 'buy' },
    { count: 30, single: 1010, fee: 5, action: 'buy' },
    { count: 40, single: 1015, fee: 6, action: 'buy' },
    { count: 50, single: 1020, fee: 7, action: 'buy' },
    { count: 60, single: 1025, fee: 8, action: 'buy' },
    { count: 70, single: 1030, fee: 9, action: 'buy' },
    { count: 80, single: 1035, fee: 10, action: 'buy' },
    { count: 350, single: 500, fee: 300, action: 'sell' },
    { count: 10, single: 450, fee: 200, action: 'sell' },
    { count: 10, single: 500, fee: 1, action: 'buy' },
    { count: 10, single: 1500, fee: 5, action: 'buy' },
];

export const sellBeforeBuy: IStockData[] = [
    { count: 10, single: 1000, fee: 3, action: 'sell' },
    { count: 20, single: 1005, fee: 4, action: 'buy' },
];

export const sellCountGreaterBuyCount: IStockData[] = [
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 20, single: 1005, fee: 4, action: 'sell' },
    { count: 20, single: 1005, fee: 4, action: 'buy' },
];

export const allSoldWithProfite: IStockData[] = [
    { count: 10, single: 1000, fee: 3, action: 'buy' },
    { count: 20, single: 500, fee: 1, action: 'buy' },
    { count: 10, single: 1500, fee: 1, action: 'sell' },
    { count: 5, single: 1500, fee: 2, action: 'sell' },
    { count: 5, single: 500, fee: 10, action: 'buy' },
    { count: 8, single: 500, fee: 20, action: 'buy' },
    { count: 10, single: 1500, fee: 10, action: 'sell' },
    { count: 10, single: 1500, fee: 15, action: 'sell' },
    { count: 50, single: 500, fee: 50, action: 'buy' },
    { count: 50, single: 500, fee: 10, action: 'buy' },
    { count: 5, single: 500, fee: 0, action: 'sell' },
    { count: 103, single: 500, fee: 0, action: 'sell' },
];
