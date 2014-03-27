var io = require('NFD-js').io
var operator = require('substance-operator')
var factory = require("./factory.js")

var resolveThread = function (wik, uri, callback) {
  var thread = {}

  thread.journal = []
  function assembleThread(journal) {
    console.log(journal)
    for (var i = journal.length - 1; i >= 0; i--) {
      operator.ObjectOperation.fromJSON(journal[i]).apply(thread)
    }
    thread.wik = wik.uri
    callback(thread)
  }
  function recursor(name, patch) {
    thread.journal.push(patch)


    if (patch.parentUri != null) {
      io.fetch({uri: patch.parentUri, type: "object"}, recursor)
    } else {
      assembleThread(thread.journal)
    }
  }

  io.fetch({uri: uri, type: "object"}, recursor)
}

module.exports = resolveThread
