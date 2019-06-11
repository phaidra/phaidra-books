// xmlModifier.js
//////////////////////////////
// PUBLIC METHODS           //
//////////////////////////////
module.exports = {
  modifyXmlObject: function(xml) {

    var iTopicCount = xml["topics"]["topic"].length;

    for (i = 0; i < iTopicCount;i++) {
      xml["topics"]["topic"][i]["name"] = (i+1) +". "+ xml["topics"]["topic"][i]["name"];
    }

    return xml;

  }//,



}
