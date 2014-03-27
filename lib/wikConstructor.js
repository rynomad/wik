var operator = require('substance-operator')
var uuidGen = require('node-uuid')
var steward = require('./steward.js')
var factory = require('./factory.js')
var storage = require('./storage.js')


var constructor = function () {
  var wik = {}
    , uuid = uuidGen.v4()
    , baseUri = "/wiki/wik/" + uuid + "/" + steward.hashName + "/" + Date.now()
    , uriPatch = operator.ObjectOperation.Create(["uri"], baseUri)
    , storyPatch = operator.ObjectOperation.Create(["story"], ["FACTORY"])
    , rootCompoundPatch = operator.ObjectOperation.Compound([uriPatch, storyPatch]);

  rootCompoundPatch.uri = baseUri;
  rootCompoundPatch.parentUri = null;
  rootCompoundPatch.apply(wik);
  storage.storePatch(rootCompoundPatch)

  wik.addFactory = factory.add
  wik.createThread = factory.createThread
  return wik;

}

module.exports = constructor
