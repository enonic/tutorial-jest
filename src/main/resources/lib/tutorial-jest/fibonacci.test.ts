import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import { fibonacci } from './fibonacci';


describe('fibonacci', () => {
    it('should return the first 10 numbers in the fibonacci sequence', () => {
        const result = fibonacci(10);
        expect(result).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
    });
});