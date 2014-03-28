var wik = {}



wik.steward = require('./lib/steward.js')
wik.create  = require('./lib/wikConstructor.js')
wik.updater = require("./lib/wikUpdater.js")
wik.factory = require('./lib/factory.js')
wik.threadSpinner = require('./lib/threadSpinner.js')
wik.resolveWik = require('./lib/wikResolver.js')
wik.resolveThread = require('./lib/threadResolver.js')
wik.diff = require('diff')
wik.deepDiff = require('deep-diff')
wik.nfd = require('NFD-js')
wik.operator = require('substance-operator')


wik.nfd.init({prefix: "wiki"}, function(){wik.steward.init(wik.updater.init);})
module.exports = wik
