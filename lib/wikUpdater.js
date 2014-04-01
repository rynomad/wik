
var resolver = require("./wikResolver.js")
var steward = require("./steward.js")
var indexWik;

var index = function(){
  var constructor = require("./wikConstructor.js");
  if (localStorage["index"] == undefined) {
    console.log(constructor)
    var indexWik = new constructor.create("index")
    indexWik.createThread(indexWik, 0, "sitemap")
    localStorage["index"] = indexWik.uri
  } else {
    resolver(localStorage["index"], function(wik) {
      console.log()
      indexWik = wik;
    })
  }
}
module.exports = {init: index, index: indexWik}



