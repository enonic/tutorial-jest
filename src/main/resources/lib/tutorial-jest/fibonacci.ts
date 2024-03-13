export function fibonacci(n: number): number[] {
    const fib = [0, 1];
    for (let i = fib.length; i < n; i++) {
        fib[i] = fib[i - 2] + fib[i - 1];
    }

    return fib;
}