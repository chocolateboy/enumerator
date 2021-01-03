declare type ElementOf<T extends readonly any[]> = T extends Array<infer V> ? V : never;
export declare const unfold: <V>(obj: Record<string, V | V[]>) => [string, V][][];
declare function enumerator<T>(alphabet: T[], length: number): Generator<T[], void, unknown>;
declare function enumerator<T extends readonly any[]>(alphabets: T[]): Generator<Array<ElementOf<T>>, void, unknown>;
declare function enumerate<T>(alphabet: T[], length: number): Array<T[]>;
declare function enumerate<T extends readonly any[]>(alphabets: T[]): Array<Array<ElementOf<T>>>;
export { enumerate, enumerator, enumerate as generate, enumerator as generator };
