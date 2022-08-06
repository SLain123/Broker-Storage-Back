import { getDelta } from '../utils/getDelta';
import {
    onlyBuy,
    allSold,
    firstRightMix,
    secondRightMix,
    thirdRightMix,
    veryGoodProfite,
} from './testStocks';

describe('getDelta func must to return correct result for all cases', () => {
    it('Array contains only a few buy actions without sell', () => {
        const result = getDelta(onlyBuy);
        expect(result.delta).toBe(950.767);
        expect(result.restCount).toBe(150);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy actions with sell actions as a result all stock must be sold', () => {
        const result = getDelta(allSold);
        expect(result.delta).toBe(0);
        expect(result.restCount).toBe(0);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved', () => {
        const result = getDelta(firstRightMix);
        expect(result.delta).toBe(507.355);
        expect(result.restCount).toBe(103);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved', () => {
        const result = getDelta(secondRightMix);
        expect(result.delta).toBe(500);
        expect(result.restCount).toBe(5);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved', () => {
        const result = getDelta(thirdRightMix);
        expect(result.delta).toBe(1000.322);
        expect(result.restCount).toBe(20);
        expect(result.error).toBe('');
    });

    it('Array contains a few buy and sell actions as a result a part of stocks must be saved with huge profite', () => {
        const result = getDelta(veryGoodProfite);
        expect(result.delta).toBe(762.217);
        expect(result.restCount).toBe(20);
        expect(result.error).toBe('');
    });
});
