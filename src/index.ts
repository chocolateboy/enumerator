type ElementOf<T extends readonly any[]> = T extends Array<infer V> ? V : never;
type Predicate = (value: any) => boolean;

const toString = {}.toString

const checkType = (check: Predicate, want: string, defaultName?: string) => {
    return (value: any, name = defaultName) => {
        if (check(value)) {
            return value
        }

        const type = value === null ? 'null' : typeof value
        const got = type === 'object' ? toString.call(value).slice(8, -1) : type

        // XXX this should probably be a subclass of TypeError, e.g.
        //
        //   new ArgumentError(value: any, name?: string, message?: string)
        const error = new TypeError(`Invalid ${name}: expected ${want}, got: ${got}`)

        throw Object.assign(error, { value })
    }
}

const checkArray = checkType(Array.isArray, 'Array', 'alphabet')
const checkLength = checkType(Number.isSafeInteger, 'integer', 'length')

export const unfold = <V>(obj: Record<string, V | V[]>) => {
    return Object.entries(obj)
        .map(([key, values] : [string, V | V[]]) => {
            return ([] as V[])
                .concat(values)
                .map((value: V) => [key, value] as [string, V])
        })
}

function enumerator<T>(alphabet: T[], length: number): Generator<T[], void, unknown>
function enumerator<T extends readonly any[]>(alphabets: T[]): Generator<Array<ElementOf<T>>, void, unknown>
function* enumerator(args: any[], length = -1) {
    let alphabetAt, result

    if (checkLength(length) < 0) { // multiple alphabets
        length = checkArray(args, 'alphabets').length // assign the correct length
        result = args.map(alphabet => checkArray(alphabet)[0]) // first result
        alphabetAt = (index: number) => args[index]
    } else { // single alphabet repeated length times
        result = Array(length).fill(checkArray(args)[0]) // first result
        alphabetAt = () => args
    }

    if (length === 0) {
        yield []
        return
    }

    const last = length - 1

    // an array of indices into each alphabet
    const odometer = Array(length).fill(0)

    while (true) {
        // emit the current result
        yield result.slice() // clone

        // 1) start at the rightmost dial
        // 2) increment the value in the current dial
        // 3) if the dial rolls over, either:
        //   a) halt if we're at the leftmost dial
        //   b) move left and go to 2

        for (let dial = last; dial >= 0; --dial) {
            const alphabet = alphabetAt(dial)

            let index = ++odometer[dial] // increment

            if (index >= alphabet.length) { // roll over
                if (dial === 0) { // leftmost dial
                    return // break out of the while loop
                } else {
                    odometer[dial] = index = 0 // reset (and move left)
                }
            }

            result[dial] = alphabet[index]

            if (index) { // didn't roll over
                break
            }
        }
    }
}

function enumerate<T>(alphabet: T[], length: number): Array<T[]>
function enumerate<T extends readonly any[]>(alphabets: T[]): Array<Array<ElementOf<T>>>
function enumerate (args: any[], length = -1) {
    return Array.from(enumerator(args, length))
}

export {
    enumerate,
    enumerator,
    enumerate as generate,
    enumerator as generator
}
