const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
assert.match(read('router.js'), /window\.router/);
['index.html', 'channel.html', 'result.html', 'profile.html'].forEach((file) => assert.match(read(file), /router\.js/));
assert.match(read('channel.html'), /data-router-back/);
['subsidy.html', 'specials.html', 'flash-sale.html', 'summer-new.html'].forEach((file) => {
  assert.match(read(file), /data-router-back/);
  assert.doesNotMatch(read(file), /class="back-home" href="index\.html"/);
});
['favorites', 'history', 'portrait', 'benefits'].forEach((view) => assert.match(read('profile.html'), new RegExp('profile\\.html\\?view=' + view)));
assert.match(read('profile.js'), /new URLSearchParams/);
console.log('router and navigation tests passed');
