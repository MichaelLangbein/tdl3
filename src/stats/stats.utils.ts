
export function estimateMean(xs: number[]) {
    const sum = xs.reduce((carry, x) => carry + x, 0);
    return sum / xs.length;
}

export function estimateVariance(xs: number[]) {
    const mean = estimateMean(xs);
    const squareOffsets = xs.map(x => x - mean).map(o => o*o);
    const variance = estimateMean(squareOffsets);
    return variance;
}

export function estimateDeviance(xs: number[]) {
    return Math.sqrt(estimateVariance(xs));
}

export function estimateLambda(xs: number[]) {
    const mean = estimateMean(xs);
    return 1.0 / mean;
}

export function exponentialPdf(x: number, lambda: number) {
    if (x < 0) return 0;
    return lambda * Math.exp(-lambda * x);
}

export function normalPdf(x: number, mu: number, sigma: number) {
    const normalizer = 1.0 / (sigma * Math.sqrt(2.0 * Math.PI));
    const exponent = - 0.5 * Math.pow((x - mu) / sigma, 2);
    return normalizer * Math.exp(exponent);
}