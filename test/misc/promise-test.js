
var impl = require('../../misc/new-promises');

var promiseTests = require('promise-tests');

promiseTests(impl.adapter, ['promises-a', 'returning-a-promise', 'always-async'], function() {
  console.log("Tests all done.");
});
