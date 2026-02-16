const cr = require('connect-redis');
console.log('Type:', typeof cr);
console.log('Keys:', Object.keys(cr));
if (typeof cr === 'function') {
    console.log('It is a function. Trying to call with mock session...');
    try {
        const store = cr({});
        console.log('Result of call:', store);
    } catch (e) {
        console.log('Call failed:', e.message);
    }
}
console.log('Default export:', cr.default);
if (cr.default) {
    console.log('Default type:', typeof cr.default);
}
console.log('RedisStore export:', cr.RedisStore);
