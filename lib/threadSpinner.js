// To allow for simple plugin construction, we reverse engineer patches by diffing an item before and after a change
var storage = require('./storage.js')
  , io = require('NFD-js').io
  , steward = require('./steward.js')
  , objectDiff = require('deep-diff')
  , textDiff = require('diff')
  , operator = require('substance-operator')
  , wikResolver = require('./wikResolver.js')

var spinner = function spinner(before, after) {
  var patches = []
    , Compound = false
    , parentUri = before.id
    , prefixLength = 109 + before.type.length
    , timestamp = Date.now().toString()
    , scrubUri = operator.ObjectOperation.Update(["id"], operator.TextOperation.Delete(prefixLength, before.id.substr(prefixLength)))
    , stampUri = operator.ObjectOperation.Update(["id"], operator.TextOperation.Insert(prefixLength, timestamp))

  if (before.type == "paragraph") {
    var diffList = textDiff.diffWords(before.text, after.text)
      , stringIndex = 0

    for (var i = 0; i < diffList.length; i++ ) {
      if ((diffList[i].added !== true) && (diffList[i].removed !== true)) {
        //nothing has changed for this section of the text; don't generate a patch but do increment the stringIndex
        stringIndex += diffList[i].value.length
      } else if (diffList[i].added == true) {
        patches.push(operator.TextOperation.Insert(stringIndex, diffList[i].value))
        stringIndex += diffList[i].value.length
      } else if (diffList[i].removed == true) {
        patches.push(operator.TextOperation.Delete(stringIndex, diffList[i].value))
      }
    }
    var objectOperation = operator.ObjectOperation.Update(["text"], operator.TextOperation.Compound(patches))
    var preFinalPatchArray = [scrubUri, stampUri, objectOperation]
  } else {
    // do deep diff on whole object
    var diffList = objectDiff.diff(before, after)
    for (var i = 0; i < diffList.length; i++) {
      if (diffList[i].kind == "N") {
        patches.push(operator.ObjectOperation.Create(diffList[i].path, diffList[i].rhs))
      } else if (diffList[i].kind == "D") {
        patches.push(operator.ObjectOperation.Delete(diffList[i].path, diffList[i].lhs))
      } else if (diffList[i].kind == "E") {
        patches.push(operator.ObjectOperation.Update(diffList[i].path, diffList[i].rhs))
      } else if (diffList[i].kind == "A") {
        patches.push(operator.ObjectOperation.Update(diffList[i].path, operator.ArrayOperation.Delete(diffList[i].index, diffList[i].item.lhs)))
        patches.push(operator.ObjectOperation.Update(diffList[i].path, operator.ArrayOperation.Insert(diffList[i].index, diffList[i].item.rhs)))
      }
    }
    var preFinalPatchArray = [scrubUri, stampUri].concat(patches)
  }



      /*  if (diffList[i].item.kind == "N") {
          patches.push(operator.ObjectOperation.Update(diffList[i].path, operator.ArrayOperation.Insert(diffList[i].index, diffList[i].item.rhs)))
        } else if (diffList[i].item.kind == "D") {
          patches.push(operator.ObjectOperation.Update(diffList[i].path, operator.ArrayOperation.Delete(diffList[i].index, diffList[i].item.lhs)))
        } else if ((diffList[i].item.kind == "E") && (diffList[i+1] !== undefined)) {
          console.log("'E' kind within 'A' kind", diffList[i+1], diffList[i])
          if (diffList[i+1].item.rhs == diffList[i].item.lhs) {
            //This is an insertion, not merely an edit
            patches.push(operator.ObjectOperation.Update(diffList[i].path, operator.ArrayOperation.Insert(diffList[i].index, diffList[i].item.rhs)))
            for (var j = i; j < diffList.length; j++) {
              if (diffList[j+1] == undefined){
                i = j;
                continue;
              } else if (diffList[j+1].kind !== "A") {

                i = j
                continue;
              } else if (diffList[j+1].kind == "A") {
                if  (diffList[j+1].item.rhs !== diffList[j].item.lhs) {
                  i = j
                  continue;
                }
              }
            }
          } else if (diffList[i+1].item.lhs == diffList[i].item.rhs) {
            // this is a deletion
            patches.push(operator.ObjectOperation.Update(diffList[i].path, operator.ArrayOperation.Delete(diffList[i].index, diffList[i].item.lhs)))
            for (var j = i; j < diffList.length; j++) {
              if (diffList[j+1] == undefined){
                i = j ;
                continue;
              } else if (diffList[j+1].kind !== "A") {

                i = j ;
                continue;
              } else if (diffList[j+1].kind == "A") {
                if  (diffList[j+1].item.kind == "D") {
                  // clean end to deletion chain
                  i = j;
                  continue
                } else {

                }
                  if ((diffList[j+2] == undefined) || (diffList[j+2].kind !== "A") || (diffList[j+2].item.kind !== "D")) {
                    // we've found the last array operation, and it's not a deletion (which would indicate a clean end to a delection edit chain), so we need to apply it
                    console.log("found unclean end of deletion chain", diffList[j+1])
                    i = j - 1;
                    continue;
                  }
                }
              }
            }
          } else {
            // this is an edit of an existing array item
            patches.push(operator.ObjectOperation.Update(diffList[i].path, operator.ArrayOperation.Delete(diffList[i].index, diffList[i].item.lhs)))
            patches.push(operator.ObjectOperation.Update(diffList[i].path, operator.ArrayOperation.Insert(diffList[i].index, diffList[i].item.rhs)))
          }
        }*/
  var clone = JSON.parse(JSON.stringify(before))
  stampUri.apply(scrubUri.apply(clone))
  console.log
  wikResolver(before.wik, function(wik){
    console.log(wik)
    for (var i = 0; i < wik.story.length; i++) {
      if (wik.story[i] == parentUri) {
        var scrubWikUri = operator.ObjectOperation.Update(["uri"], operator.TextOperation.Delete(112, wik.uri.substr(112)))
          , stampWikUri = operator.ObjectOperation.Update(["uri"], operator.TextOperation.Insert(112, timestamp))
          , change1 = operator.ObjectOperation.Update(["story"], operator.ArrayOperation.Delete(i, wik.story[i]))
          , change2 = operator.ObjectOperation.Update(["story"], operator.ArrayOperation.Insert(i, clone.id))
          , wikCompound = operator.ObjectOperation.Compound([scrubWikUri, stampWikUri, change1, change2])
          , wikToStore = wikCompound.toJSON();


        wikToStore.parentUri = wik.uri
        wikCompound.apply(wik)
        wikToStore.uri = wik.uri
        var wikReferenceScrub = operator.ObjectOperation.Update(["wik"], operator.TextOperation.Delete(112, before.wik.substr(112)))
        var wikReferenceStamp = operator.ObjectOperation.Update(["wik"], operator.TextOperation.Insert(112, timestamp))
        preFinalPatchArray.concat([wikReferenceScrub, wikReferenceStamp])
        var compound = operator.ObjectOperation.Compound(preFinalPatchArray)
        compound.apply(before)
        var toStore = compound.toJSON()
        toStore.parentUri = parentUri
        toStore.uri = before.id
        storage.storePatch(toStore)
        storage.storePatch(wikToStore)
        console.log(wik, before)
        continue;
      }
    }
  })
}

module.exports = spinner
