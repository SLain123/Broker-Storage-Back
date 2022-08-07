export interface IStock {
    title: string;
    count: number;
    single: number;
    fee: number;
    action: 'buy' | 'sell';
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
        delta: +(sumPrice / sumCount).toFixed(3),
        count: sumCount,
    };
};

export const getDeltaProfite = (stockList: IStock[]) => {
    let deltaBuy = 0;
    let deltaSell = 0;
    let countBuy = 0;
    let countSell = 0;
    let countRest = 0;
    let error = '';

    const startCycle = (cycleList: IStock[]) => {
        let allList = cycleList;

        const getActions = (action: 'buy' | 'sell', outList: IStock[]) => {
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

        const buy = calculateDelta(getActions('buy', allList), 'buy');
        if (deltaBuy) {
            deltaBuy = +(
                (deltaBuy * countRest + buy.delta * buy.count) /
                (buy.count + countRest)
            ).toFixed(3);
        } else {
            deltaBuy = buy.delta;
        }
        countBuy += buy.count;

        const sell =
            allList.length > 0
                ? calculateDelta(getActions('sell', allList), 'sell')
                : { delta: 0, count: 0 };
        if (deltaSell) {
            deltaSell = +(
                (deltaSell * countSell + sell.delta * sell.count) /
                (sell.count + countSell)
            ).toFixed(3);
        } else {
            deltaSell = sell.delta;
        }
        countSell += sell.count;

        countRest += buy.count - sell.count;

        if (allList.length > 0) {
            startCycle(allList);
        }
    };

    startCycle(stockList);
   
    if (countRest < 1) {
        deltaBuy = 0;
    }

    return { deltaBuy, countRest, deltaSell, error };
};
