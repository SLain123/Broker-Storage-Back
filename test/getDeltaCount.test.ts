import { getDeltaCount } from '../utils/getDeltaCount';
import {
    onlyBuy,
    allSold,
    firstRightMix,
    secondRightMix,
    thirdRightMix,
    fourthRightMix,
    veryGoodProfite,
    maxSellActions,
    negativeProfite,
    allSoldWithProfite,
    sellBeforeBuy,
    sellCountGreaterBuyCount,
} from './testStocks';

describe('getDelta func must to return correct result for all cases', () => {
    it('Array contains only a few buy actions without sell', () => {
        const result = getDeltaCount(onlyBuy);
        expect(result.deltaBuy).toBe(950.7666666666667);
        expect(result.deltaSell).toBe(0);
        expect(result.countSell).toBe(0);
        expect(result.countRest).toBe(150);
        expect(result.allFee).toBe(115);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy actions with sell actions as a result all stock must be sold', () => {
        const result = getDeltaCount(allSold);
        expect(result.deltaBuy).toBe(0);
        expect(result.deltaSell).toBe(499.3888888888889);
        expect(result.countSell).toBe(180);
        expect(result.countRest).toBe(0);
        expect(result.allFee).toBe(211);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved', () => {
        const result = getDeltaCount(firstRightMix);
        expect(result.deltaBuy).toBe(507.25396825396825);
        expect(result.deltaSell).toBe(1374.3);
        expect(result.countSell).toBe(40);
        expect(result.countRest).toBe(103);
        expect(result.allFee).toBe(122);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved', () => {
        const result = getDeltaCount(secondRightMix);
        expect(result.deltaBuy).toBe(500);
        expect(result.deltaSell).toBe(730.4461538461538);
        expect(result.countSell).toBe(65);
        expect(result.countRest).toBe(5);
        expect(result.allFee).toBe(84);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved', () => {
        const result = getDeltaCount(thirdRightMix);
        expect(result.deltaBuy).toBe(1000.3);
        expect(result.deltaSell).toBe(999.9571428571429);
        expect(result.countSell).toBe(70);
        expect(result.countRest).toBe(20);
        expect(result.allFee).toBe(30);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result all stocks must be sold', () => {
        const result = getDeltaCount(fourthRightMix);
        expect(result.deltaBuy).toBe(0);
        expect(result.deltaSell).toBe(1156);
        expect(result.countSell).toBe(50);
        expect(result.countRest).toBe(0);
        expect(result.allFee).toBe(400);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved with huge profite', () => {
        const result = getDeltaCount(veryGoodProfite);
        expect(result.deltaBuy).toBe(761.7888888888889);
        expect(result.deltaSell).toBe(4999.142857142857);
        expect(result.countSell).toBe(350);
        expect(result.countRest).toBe(20);
        expect(result.allFee).toBe(353);
        expect(result.error).toBe('');
    });

    it('Array contains a one buy and a few sell actions as a result a part of stocks must be saved', () => {
        const result = getDeltaCount(maxSellActions);
        expect(result.deltaBuy).toBe(1000.003);
        expect(result.deltaSell).toBe(1369.0566666666666);
        expect(result.countSell).toBe(900);
        expect(result.countRest).toBe(100);
        expect(result.allFee).toBe(152);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved with huge loss', () => {
        const result = getDeltaCount(negativeProfite);
        expect(result.deltaBuy).toBe(1000.3);
        expect(result.deltaSell).toBe(497.22222222222223);
        expect(result.countSell).toBe(360);
        expect(result.countRest).toBe(20);
        expect(result.allFee).toBe(558);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result all stocks must be sold with profite', () => {
        const result = getDeltaCount(allSoldWithProfite);
        expect(result.deltaBuy).toBe(0);
        expect(result.deltaSell).toBe(744.5594405594405);
        expect(result.countSell).toBe(143);
        expect(result.countRest).toBe(0);
        expect(result.allFee).toBe(122);
        expect(result.error).toBe('');
    });

    it('Wrong array which sell operation exists before buy must return error', () => {
        const result = getDeltaCount(sellBeforeBuy);
        expect(result.deltaBuy).toBe(0);
        expect(result.deltaSell).toBe(0);
        expect(result.countSell).toBe(0);
        expect(result.countRest).toBe(0);
        expect(result.allFee).toBe(0);
        expect(result.error).toContain('Error!');
    });

    it('Wrong array which sell operation exists before buy must return error', () => {
        const result = getDeltaCount(sellCountGreaterBuyCount);
        expect(result.deltaBuy).toBe(0);
        expect(result.deltaSell).toBe(0);
        expect(result.countSell).toBe(0);
        expect(result.countRest).toBe(0);
        expect(result.allFee).toBe(0);
        expect(result.error).toContain('Error!');
    });
});
