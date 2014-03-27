//
var storage = {}
var io = require('NFD-js').io
storage.storePatch = function(patch){

  io.publish({
    uri: patch.uri,
    type: "object",
    thing: patch,
    version: false
  })
}

module.exports = storage
