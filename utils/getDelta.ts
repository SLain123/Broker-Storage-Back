export interface IStock {
    title: string;
    count: number;
    single: number;
    fee: number;
    action: 'buy' | 'sell';
}

const useBuy = (buyList: IStock[]) => {
    let sumPrice = 0;
    let sumCount = 0;

    buyList.forEach(({ single, count, fee }) => {
        sumPrice = sumPrice + (single * count + fee);
        sumCount = sumCount + count;
    });

    return {
        delta: +(sumPrice / sumCount).toFixed(3),
        count: sumCount,
    };
};

const useSell = (sellList: IStock[]) => {
    let restCount = 0;
    let sumFee = 0;

    if (sellList.length === 0) {
        return;
    } else {
        sellList.forEach(({ count, fee }) => {
            restCount += count;
            sumFee += fee;
        });
    }

    return { count: restCount, singleFee: sumFee / restCount };
};

export const getDelta = (stockList: IStock[]) => {
    let delta = 0;
    let restCount = 0;
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

        const buy = useBuy(getActions('buy', allList));
        if (delta) {
            delta = +(
                (delta * restCount + buy.delta * buy.count) /
                (buy.count + restCount)
            ).toFixed(3);
        } else {
            delta = buy.delta;
        }

        const sell =
            allList.length > 0
                ? useSell(getActions('sell', allList))
                : { count: 0, singleFee: 0 };
        restCount += buy.count - sell.count;

        delta += +sell.singleFee.toFixed(3);

        if (allList.length > 0) {
            startCycle(allList);
        }
    };

    startCycle(stockList);

    if (restCount < 1) {
        delta = 0;
    }

    return { delta, restCount, error };
};
