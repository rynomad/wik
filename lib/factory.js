//Entry point for creating new threads and calling various plugins

var factory = {}
  , operator = require('substance-operator')
  , uuidGen = require('node-uuid')
  , storage = require('./storage.js')
  , steward = require('./steward.js')
  , wikResolver = require("./wikResolver.js")
  , threadResolver = require("./threadResolver.js")
  , spinner = require("./threadSpinner.js")

factory.add = function(callback) {
  console.log('addFactory')
  var wik = this
    , parentUri = wik.uri
    , addFactory = operator.ObjectOperation.Update(["story"], operator.ArrayOperation.Insert(wik.story.length, "FACTORY"))
    , scrubUri = operator.ObjectOperation.Update(["uri"], operator.TextOperation.Delete(112, wik.uri.substr(112)))
    , stampUri = operator.ObjectOperation.Update(["uri"], operator.TextOperation.Insert(112, Date.now().toString()))
    , compoundPatch = operator.ObjectOperation.Compound([addFactory, scrubUri, stampUri])

  console.log("patches generated")
  compoundPatch.apply(wik)

  var jsonPatch = compoundPatch.toJSON()
  jsonPatch.uri = wik.uri
  jsonPatch.parentUri = parentUri
  storage.storePatch(jsonPatch)
  wikResolver(localStorage["index"], function(index){
    threadResolver(index, index.story[0], function(sitemap){
      var newSitemap = JSON.parse(JSON.stringify(sitemap))
      newSitemap[wik.title] = wik.uri
      spinner(sitemap, newSitemap)
    })
  })
  return compoundPatch

}

factory.createThread = function(wik, pos, targetType) {

  var uuid = uuidGen.v4()
    , timestamp = Date.now().toString()
    , parentUri = wik.uri
    , threadUri = "/wiki/" + targetType + "/" + uuid + "/" + steward.hashName + "/" + timestamp
    , scrubFactory = operator.ObjectOperation.Update(["story"], operator.ArrayOperation.Delete(pos, "FACTORY"))
    , addItem = operator.ObjectOperation.Update(["story"], operator.ArrayOperation.Insert(pos, threadUri))
    , scrubUri = operator.ObjectOperation.Update(["uri"], operator.TextOperation.Delete(112, wik.uri.substr(112)))
    , stampUri = operator.ObjectOperation.Update(["uri"], operator.TextOperation.Insert(112, timestamp))
    , wikCompound = operator.ObjectOperation.Compound([scrubFactory, addItem, scrubUri, stampUri])
    , wikPatchJSON = wikCompound.toJSON()
    , thread = {}
    , addtype = operator.ObjectOperation.Create(["type"], targetType)
    , addUUID = operator.ObjectOperation.Create(["id"], threadUri)
    , initThread = operator.ObjectOperation.Compound([addtype, addUUID])
    , threadPatch = initThread.toJSON();


  initThread.apply(thread)
  wikCompound.apply(wik)

  threadPatch.parentUri = null
  threadPatch.uri = threadUri
  wikPatchJSON.parentUri = parentUri
  wikPatchJSON.uri = wik.uri

  storage.storePatch(wikPatchJSON)
  storage.storePatch(threadPatch)
  console.log(wikResolver, threadResolver, spinner)
  wikResolver(localStorage["index"], function(index){
    threadResolver(index, index.story[0], function(sitemap){
      var newSitemap = JSON.parse(JSON.stringify(sitemap))
      newSitemap[wik.title] = wik.uri
      spinner(sitemap, newSitemap)
    })
  })

}

module.exports = factory
