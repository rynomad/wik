var wik = {}




wik.create  = require('./lib/wikConstructor.js')
wik.factory = require('./lib/factory.js')
wik.threadSpinner = require('./lib/threadSpinner.js')
wik.resolveWik = require('./lib/wikResolver.js')
wik.resolveThread = require('./lib/threadResolver.js')
wik.diff = require('diff')
wik.deepDiff = require('deep-diff')
wik.nfd = require('NFD-js')
wik.operator = require('substance-operator')
module.exports = wik
