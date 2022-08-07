import { getDeltaProfite } from '../utils/getDelta';
import {
    onlyBuy,
    allSold,
    firstRightMix,
    secondRightMix,
    thirdRightMix,
    veryGoodProfite,
    maxhSellActions,
} from './testStocks';

describe('getDelta func must to return correct result for all cases', () => {
    it('Array contains only a few buy actions without sell', () => {
        const result = getDeltaProfite(onlyBuy);
        expect(result.deltaBuy).toBe(950.767);
        expect(result.deltaSell).toBe(0);
        expect(result.countRest).toBe(150);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy actions with sell actions as a result all stock must be sold', () => {
        const result = getDeltaProfite(allSold);
        expect(result.deltaBuy).toBe(0);
        expect(result.deltaSell).toBe(499.389);
        expect(result.countRest).toBe(0);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved', () => {
        const result = getDeltaProfite(firstRightMix);
        expect(result.deltaBuy).toBe(507.254);
        expect(result.deltaSell).toBe(1374.3);
        expect(result.countRest).toBe(103);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved', () => {
        const result = getDeltaProfite(secondRightMix);
        expect(result.deltaBuy).toBe(500);
        expect(result.deltaSell).toBe(730.446);
        expect(result.countRest).toBe(5);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved', () => {
        const result = getDeltaProfite(thirdRightMix);
        expect(result.deltaBuy).toBe(1000.3);
        expect(result.deltaSell).toBe(999.957);
        expect(result.countRest).toBe(20);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved with huge profite', () => {
        const result = getDeltaProfite(veryGoodProfite);
        expect(result.deltaBuy).toBe(761.789);
        expect(result.deltaSell).toBe(4999.143);
        expect(result.countRest).toBe(20);
        expect(result.error).toBe('');
    });

    it('Array contains a one buy and a few sell actions as a result a part of stocks must be saved', () => {
        const result = getDeltaProfite(maxhSellActions);
        expect(result.deltaBuy).toBe(1000.003);
        expect(result.deltaSell).toBe(1369.057);
        expect(result.countRest).toBe(100);
        expect(result.error).toBe('');
    });
});
