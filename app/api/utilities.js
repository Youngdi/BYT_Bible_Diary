export const def = x => typeof x !== 'undefined';
export const undef = x => !def(x)
export const length = ([x, ...xs], len = 0) => def(x) ? length(xs, len + 1) : len;
export const filter = ([x, ...xs], fn) => def(x) 
    ? fn(x)
        ? [x, ...filter(xs, fn)] : [...filter(xs, fn)]
    : [];
export const reject = ([x, ...xs], fn) => {
      if (undef(x)) return []
      if (!fn(x)) {
        return [x, ...reject(xs, fn)]
      } else {
        return [...reject(xs, fn)]
      }
    };
export const tail = ([x, ...xs]) => xs;
export const head = ([x]) => x;
export const partition = (xs, fn) => [filter(xs, fn), reject(xs, fn)];
export const isArray = x => Array.isArray(x);
export const flatten = ([x, ...xs]) => def(x)
    ? isArray(x) ? [...flatten(x), ...flatten(xs)] : [x, ...flatten(xs)]
    : [];
export const quicksort = (array) => {
  if (!length(array)) return []
  const [less, more] = partition(tail(array), x => x < head(array))
  return flatten([quicksort(less), head(array), quicksort(more)])
}
export const sperateVerse = (verse, searchKey) => [
  ...(verse.toUpperCase().indexOf(searchKey.toUpperCase()) == -1)
  ? [verse] 
  : [verse.slice(0, verse.toUpperCase().indexOf(searchKey.toUpperCase())),
      verse.slice(verse.toUpperCase().indexOf(searchKey.toUpperCase()), verse.toUpperCase().indexOf(searchKey.toUpperCase()) + searchKey.length),
      ...sperateVerse(
        verse.slice(verse.toUpperCase().indexOf(searchKey.toUpperCase()) + searchKey.length),
        searchKey
       )
     ].filter(v => v != "")
];
