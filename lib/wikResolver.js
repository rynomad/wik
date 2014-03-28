var io = require('NFD-js').io
var operator = require('substance-operator')
var factory = require("./factory.js")

var resolveWik = function (uri, callback) {
  var wik = {}
  wik.journal = []
  function assembleWik(journal) {
    console.log(journal)
    for (var i = journal.length - 1; i >= 0; i--) {
      operator.ObjectOperation.fromJSON(journal[i]).apply(wik)
    }
    wik.addFactory = factory.add
    wik.createThread = factory.createThread
    callback(wik)
  }
  function recursor(name, patch) {
    wik.journal.push(patch)


    if (patch.parentUri != null) {
      io.fetch({uri: patch.parentUri, type: "object"}, recursor)
    } else {
      assembleWik(wik.journal)
    }
  }

  io.fetch({uri: uri, type: "object"}, recursor)
}

module.exports = resolveWik
