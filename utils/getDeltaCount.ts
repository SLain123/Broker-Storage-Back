export interface IStock {
    title: string;
    count: number;
    single: number;
    fee: number;
    action: 'buy' | 'sell';
}

enum Error {
    firstSell = "Error! Sell operation must't exist before buy",
    sellCountGreaterBuy = 'Error! Count of sell operations exceeds buy',
}

const calculateDelta = (list: IStock[], action: 'buy' | 'sell') => {
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
    };
};

export const getDeltaCount = (stockList: IStock[]) => {
    let deltaBuy = 0;
    let deltaSell = 0;
    let countBuy = 0;
    let countSell = 0;
    let countRest = 0;
    let error = '';

    const resetAllMath = () => {
        deltaBuy = 0;
        deltaSell = 0;
        countBuy = 0;
        countSell = 0;
        countRest = 0;
    };

    const startCycle = (cycleList: IStock[]) => {
        let allList = cycleList;

        const separateByAction = (
            action: 'buy' | 'sell',
            outList: IStock[],
        ) => {
            const resultList = [];
            if (outList.length === 0) {
                return;
            }

            for (let i = 0; i < outList.length; i++) {
                if (outList[i].action === action) {
                    resultList.push(outList[i]);
                } else {
                    allList = outList.slice(i);
                    break;
                }

                if (i === outList.length - 1) {
                    allList = outList.slice(i + 1);
                }
            }

            return resultList;
        };

        const buy = calculateDelta(separateByAction('buy', allList), 'buy');
        if (deltaBuy) {
            deltaBuy = +(
                (deltaBuy * countRest + buy.delta * buy.count) /
                (buy.count + countRest)
            );
        } else {
            deltaBuy = buy.delta;
        }
        countBuy += buy.count;

        const sell =
            allList.length > 0
                ? calculateDelta(separateByAction('sell', allList), 'sell')
                : { delta: 0, count: 0 };
        if (deltaSell) {
            deltaSell = +(
                (deltaSell * countSell + sell.delta * sell.count) /
                (sell.count + countSell)
            );
        } else {
            deltaSell = sell.delta;
        }
        countSell += sell.count;

        countRest += buy.count - sell.count;

        if (countSell > countBuy) {
            error = Error.sellCountGreaterBuy;
            resetAllMath();
        } else if (allList.length > 0) {
            startCycle(allList);
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

    return { deltaBuy, countRest, deltaSell, error };
};
