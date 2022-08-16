
export class Queue<T> {
    private data: (T | null)[];
    private head = 0;
    private tail = 0;

    constructor(capacity: number) {
        this.data = Array(capacity).fill(0).map(v => null);
    }

    public enqueue(val: T): boolean {
        const location = this.tail;
        if (!this.data[location]) {
            this.data[location] = val;
            this.tail = this.shiftUp(this.tail);
            return true;
        } else {
            return false;
        }
    }

    public dequeue() {
        const location = this.head;
        const data = this.data[location];
        this.data[location] = null;
        this.head = this.shiftUp(location);
        return data;
    }

    private shiftUp(n: number) {
        return (n + 1) % this.data.length;
    }
}



export type SetEqualityFunction<T> = (a: T, b: T) => boolean;
export type SetSelectionPredicate<T> = (a: T) => boolean;

export class Set<T> {
    private data: T[] = [];

    constructor(private equalityFunction: SetEqualityFunction<T> = (a, b) => a === b) {}

    public add(entry: T): boolean {
        for (const d of this.data) {
            if (this.equalityFunction(entry, d)) return false;
        }
        this.data.push(entry);
        return true;
    }

    public get(predicate: SetSelectionPredicate<T>): T[] {
        const out: T[] = [];
        for (const d of this.data) {
            if (predicate(d)) {
                out.push(d);
            };
        }
        return out;
    }
}