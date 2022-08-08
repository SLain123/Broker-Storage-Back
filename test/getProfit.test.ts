import { getDeltaCount } from '../utils/getDeltaCount';
import { getProfite } from '../utils/getProfit';
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

describe('getProfit func must to return correct result for all cases', () => {
    it('Array contains only a few buy actions without sell', () => {
        const result = getProfite(getDeltaCount(onlyBuy));
        expect(result.profit).toBe(0);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy actions with sell actions, negative profite', () => {
        const result = getProfite(getDeltaCount(allSold));
        expect(result.profit).toBe(-145211);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions, postitve profite', () => {
        const result = getProfite(getDeltaCount(firstRightMix));
        expect(result.profit).toBe(33547);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions, positive profite', () => {
        const result = getProfite(getDeltaCount(secondRightMix));
        expect(result.profit).toBe(10278);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions, negative profite for the same price, but because of fee', () => {
        const result = getProfite(getDeltaCount(thirdRightMix));
        expect(result.profit).toBe(-24);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions, all sold', () => {
        const result = getProfite(getDeltaCount(fourthRightMix));
        expect(result.profit).toBe(17600);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved with huge profite', () => {
        const result = getProfite(getDeltaCount(veryGoodProfite));
        expect(result.profit).toBe(1396434);
        expect(result.error).toBe('');
    });

    it('Array contains a one buy and a few sell actions as a result a part of stocks must be saved', () => {
        const result = getProfite(getDeltaCount(maxSellActions));
        expect(result.profit).toBe(332148);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved with huge loss', () => {
        const result = getProfite(getDeltaCount(negativeProfite));
        expect(result.profit).toBe(-189013);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result all stocks must be sold with profite', () => {
        const result = getProfite(getDeltaCount(allSoldWithProfite));
        expect(result.profit).toBe(29878);
        expect(result.error).toBe('');
    });

    it('Wrong array which sell operation exists before buy must return error', () => {
        const result = getProfite(getDeltaCount(sellBeforeBuy));
        expect(result.profit).toBe(0);
        expect(result.error).toContain('Error!');
    });

    it('Wrong array which sell operation exists before buy must return error', () => {
        const result = getProfite(getDeltaCount(sellCountGreaterBuyCount));
        expect(result.profit).toBe(0);
        expect(result.error).toContain('Error!');
    });
});
