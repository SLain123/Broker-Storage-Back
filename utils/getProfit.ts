interface ICalculateData {
    sumBuy: number;
    deltaSell: number;
    countBuy: number;
    countSell: number;
    error: string;
}

export const getProfite = (data: ICalculateData) => {
    const { sumBuy, deltaSell, countBuy, countSell, error } = data;
    let profit = 0;
    const deltaBuyByAll = sumBuy / countBuy;
  
    if (!error) {
        profit = Math.round(deltaSell * countSell - deltaBuyByAll * countSell);
    }

    return { error, profit };
};
