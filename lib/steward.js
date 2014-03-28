// Publisher/Steward Identity module, facade shim for now

var steward = {}
var io = require("NFD-js").io

steward.hashName = "0000000000000000000000000000000000000000000000000000000000000000"

steward.init = function(callback){
  io.getHashName(function(hashName){
    steward.hashName = hashName
    callback()
  })
}
module.exports = steward
