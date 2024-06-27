const data = Array.from({ length: 1_000 }, (_, i) => i + 1);

/**
 *
 * @param {String} name
 * @param {() => Promise<Number>} fn
 */
async function measurePerformance(name, fn) {
  console.log(`Start: ${name}`);
  performance.mark('mf-start');
  const result = await fn();
  performance.mark('mf-end');
  const runTime = performance.measure(
    'Czas wykonania kodu',
    'mf-start',
    'mf-end'
  );
  console.log(`Wynik z ${name}: ${result}`);
  console.log(`Czas wykonywania: ${runTime.duration.toFixed(2)}ms`);
}

/**
 * @param {Number} a
 * @param {Number} b
 * @returns {Promise<Number>}
 */
const asyncAdd = (a, b) => new Promise((res) => setTimeout(res(a + b), 100));

/**
 * @param {Number[]} data
 * @returns {Number}
 */
const reduceAdd = async (data) =>
  data.reduce(async (prev, curr) => await asyncAdd(await prev, curr), 0);

/**
 * @param {Number[]} data
 * @returns {Promise<Number>}
 */
const parallelAdd = async (data) => {
  if (data.length === 2) return await asyncAdd(...data);

  const promises = Array.from(
    {
      length: Math.floor(data.length / 2),
    },
    (_, i) => asyncAdd(data[i * 2], data[i * 2 + 1])
  );
  const values = await Promise.all(promises);

  if (data.length % 2 === 0) return await parallelAdd(values);

  return await parallelAdd([...values, data.at(-1)]);
};

await measurePerformance('reduceAdd', () => reduceAdd(data));
await measurePerformance('parallelAdd', () => parallelAdd(data));
