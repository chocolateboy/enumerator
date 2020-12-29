const { enumerate, enumerator, unfold } = require('..')

const options = {
    color: ['black', 'pink'],
    size: ['small', 'large'],
    discount: false,
}

Object.assign(global, {
    enumerate,
    enumerator,
    unfold,
    bools: [true, false],
    digits: Array.from({ length: 10 }, (_, i) => i),
    words: ['foo', 'bar', 'baz'],
    options,
})
