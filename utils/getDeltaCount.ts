export interface IStockData {
    count: number;
    single: number;
    fee: number;
    action: 'buy' | 'sell';
}

enum Error {
    firstSell = "Error! Sell operation must't exist before buy",
    sellCountGreaterBuy = 'Error! Count of sell operations exceeds buy',
}

const calculateDelta = (list: IStockData[], action: 'buy' | 'sell') => {
    let sumPrice = 0;
    let sumCount = 0;

    list.forEach(({ single, count, fee }) => {
        const calculatedSumPrice =
            action === 'buy' ? single * count + fee : single * count - fee;
        sumPrice += calculatedSumPrice;
        sumCount += count;
    });

    return {
        delta: +(sumPrice / sumCount),
        count: sumCount,
        sumPrice,
    };
};

export const getDeltaCount = (stockList: IStockData[]) => {
    let deltaBuy = 0;
    let deltaSell = 0;
    let countBuy = 0;
    let countSell = 0;
    let countRest = 0;
    let sumBuy = 0;
    let sumSell = 0;
    let error = '';

    const resetAllMaths = () => {
        deltaBuy = 0;
        deltaSell = 0;
        countBuy = 0;
        countSell = 0;
        countRest = 0;
        sumBuy = 0;
        sumSell = 0;
    };

    const startCycle = (cycleList: IStockData[]) => {
        const separateByAction = (
            action: 'buy' | 'sell',
            outList: IStockData[],
        ) => {
            const resultList = [];
            if (outList.length === 0) {
                return;
            }

            for (let i = 0; i < outList.length; i++) {
                if (outList[i].action === action) {
                    resultList.push(outList[i]);
                } else {
                    cycleList = outList.slice(i);
                    break;
                }

                if (i === outList.length - 1) {
                    cycleList = outList.slice(i + 1);
                }
            }

            return resultList;
        };

        const buy = calculateDelta(separateByAction('buy', cycleList), 'buy');
        if (deltaBuy) {
            deltaBuy = +(
                (deltaBuy * countRest + buy.delta * buy.count) /
                (buy.count + countRest)
            );
        } else {
            deltaBuy = buy.delta;
        }
        countBuy += buy.count;
        sumBuy += buy.sumPrice;

        const sell =
            cycleList.length > 0
                ? calculateDelta(separateByAction('sell', cycleList), 'sell')
                : { delta: 0, count: 0, sumPrice: 0 };
        if (deltaSell) {
            deltaSell = +(
                (deltaSell * countSell + sell.delta * sell.count) /
                (sell.count + countSell)
            );
        } else {
            deltaSell = sell.delta;
        }
        countSell += sell.count;
        sumSell += sell.sumPrice;

        countRest += buy.count - sell.count;

        if (countSell > countBuy) {
            error = Error.sellCountGreaterBuy;
            resetAllMaths();
        } else if (cycleList.length > 0) {
            startCycle(cycleList);
        }
    };

    if (stockList[0].action === 'sell') {
        error = Error.firstSell;
    } else {
        startCycle(stockList);
    }

    if (countRest < 1) {
        deltaBuy = 0;
    }

    return {
        deltaBuy,
        deltaSell,
        countBuy,
        countSell,
        countRest,
        sumBuy,
        sumSell,
        error,
    };
};
