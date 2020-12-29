type ElementOf<T> = T extends Array<infer V> ? V : never;

const checkType = (predicate: Function, want: string, defaultName?: string) => {
    return (value: any, name = defaultName) => {
        if (!predicate(value)) {
            const type = value === null ? 'null' : typeof value
            const got = type === 'object' ? {}.toString.call(value).slice(8, -1) : type
            throw new TypeError(`Invalid ${name} (${value}): expected ${want}, got: ${got}`)
        }

        return value
    }
}

const checkArray = checkType(Array.isArray, 'Array', 'alphabet')
const checkLength = checkType(Number.isSafeInteger, 'integer')

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
    let alphabetAt, result, done = false

    if (checkLength(length, 'length') < 0) { // multiple alphabets
        length = checkArray(args, 'alphabets').length // assign the correct length
        result = args.map(alphabet => checkArray(alphabet)[0]) // first result
        alphabetAt = (index: number) => args[index]
    } else { // single alphabet repeated length times
        checkArray(args)
        result = Array.from({ length }, () => args[0]) // first result
        alphabetAt = () => args
    }

    if (length === 0) {
        yield []
        return
    }

    const last = length - 1

    // an array of indices into each alphabet
    const odometer = Array.from({ length }, () => 0)

    while (true) {
        // emit the current result
        yield result.slice() // clone

        // 1) start at the rightmost column
        // 2) increment the value in the current column
        // 3) if the column rolls over, either:
        //   a) halt if we're at the leftmost column
        //   b) move left and go to 2

        for (let column = last; column >= 0; --column) {
            const alphabet = alphabetAt(column)
            const index = ++odometer[column] // increment

            if (index >= alphabet.length) { // roll over
                if (column === 0) { // leftmost column
                    done = true // last iteration so no need to break
                } else {
                    // result[column] = alphabet[odometer[column] = 0]
                    odometer[column] = 0 // reset
                    result[column] = alphabet[0]
                }
            } else {
                result[column] = alphabet[index]
                break
            }
        }

        if (done) {
            break
        }
    }
}

function enumerate<T>(alphabet: T[], length: number): Array<T[]>
function enumerate<T extends readonly any[]>(alphabets: T[]): Array<Array<ElementOf<T>>>
function enumerate (args: any[], length = -1) {
    return Array.from(enumerator(args, length))
}

export { enumerate, enumerator }
