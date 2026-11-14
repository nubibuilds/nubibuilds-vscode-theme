// A self-contained script for testing the debugger colours (TESTING.md, step T10).
// Open this file, set the breakpoints described there, then press F5 and pick "Node.js".

const inventory = [
  { sku: 'ABC-1234', name: 'Widget', price: 99.5, tags: ['new', 'hardware'], inStock: true },
  { sku: 'XYZ-0001', name: 'Gadget', price: 150, tags: [], inStock: false },
  { sku: 'QRS-0420', name: 'Gizmo', price: 12.25, tags: ['sale'], inStock: true },
];

function priceWithTax(item, rate = 0.11) {
  const tax = item.price * rate; // breakpoint here
  return Math.round((item.price + tax) * 100) / 100;
}

function summarise(items) {
  let total = 0;
  const lines = [];
  for (const item of items) {
    const price = priceWithTax(item); // conditional breakpoint here: item.price > 100
    total += price;
    lines.push(`${item.sku} ${item.name.padEnd(8)} ${price}`); // logpoint here: price is {price}
  }
  return { total, lines, count: items.length, nothing: null, missing: undefined };
}

const summary = summarise(inventory);

console.log('info: summary ready', summary);
console.info('info: %d items', summary.count);
console.warn('warning: %d item(s) out of stock', inventory.filter((item) => !item.inStock).length);
console.error('error: this is a sample error line');

try {
  JSON.parse('{ not valid json');
} catch (error) {
  console.error(error); // enable "Caught Exceptions" to see the exception widget
}
