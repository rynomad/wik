var operator = require('substance-operator')
var uuidGen = require('node-uuid')
var steward = require('./steward.js')
var factory = require('./factory.js')
var storage = require('./storage.js')
var spinner = require("./threadSpinner.js")
var io = require("NFD-js").io
var wikResolver = require("./wikResolver.js")
var threadResolver = require("./threadResolver.js")


var wikconstructor = function (title) {
  var wik = {}
    , uuid = uuidGen.v4()
    , baseUri = "/wiki/wik/" + uuid + "/" + steward.hashName + "/" + Date.now()
    , uriPatch = operator.ObjectOperation.Create(["uri"], baseUri)
    , storyPatch = operator.ObjectOperation.Create(["story"], ["FACTORY"])
    , titlePatch = operator.ObjectOperation.Create(["title"], title)
    , rootCompoundPatch = operator.ObjectOperation.Compound([uriPatch, storyPatch, titlePatch]);

  rootCompoundPatch.uri = baseUri;
  rootCompoundPatch.parentUri = null;
  rootCompoundPatch.apply(this);
  storage.storePatch(rootCompoundPatch)
  this.journal = [rootCompoundPatch]
  wikResolver(localStorage["index"], function(index){
    threadResolver(index, index.story[0], function(sitemap){
      var newSitemap = JSON.parse(JSON.stringify(sitemap))
      newSitemap[title] = baseUri;
      spinner(sitemap, newSitemap)
    })
  })
  return this;

}

wikconstructor.prototype.createThread = factory.createThread
wikconstructor.prototype.addFactory = factory.add

var wikResolver = function (uri, callback) {
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


module.exports = {create: wikconstructor, resolve: wikResolver}
