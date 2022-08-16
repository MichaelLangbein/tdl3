
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


export class ExponentialDistribution {
    constructor(private lambda: number = 1.0) {}

    public estimateParas(xs: number[]) {
        const mean = estimateMean(xs);
        const lambda = 1.0 / mean;
        this.lambda = lambda;
        return lambda;
    }

    public pdf(x: number) {
        if (x < 0) return 0;
        return this.lambda * Math.exp(-this.lambda * x);
    }

    /**
     * P(x | x > x0)
     */
    public pdfConditional(x: number, x0: number) {
        // exponential pdf is memory-less
        return this.pdf(x - x0);
    }

    public expectation() {
        return 1 / this.lambda;
    }

    public conditionalExpectation(x0: number) {
        return x0 + this.expectation();
    }
}


export class NormalDistribution {

    constructor(private mu: number = 0, private sigma: number = 1) {}

    public estimateParas(xs: number[]) {
        this.mu = estimateMean(xs);
        this.sigma = estimateDeviance(xs);
    }

    public pdf(x: number) {
        const sigma = this.sigma;
        const mu = this.mu;
        const normalizer = 1.0 / (sigma * Math.sqrt(2.0 * Math.PI));
        const exponent = - 0.5 * Math.pow((x - mu) / sigma, 2);
        return normalizer * Math.exp(exponent);
    }
}

