//manifest.js
var fs = require("fs"); //file system

var conf = require("./configuration");
var io = require("./ioUtilities");

///////////////////////////////
// MEMBER VARIABLES          //
///////////////////////////////

//variables initiated before creation of the manifest
var manifest = null;
var strBookName = null;
var strManifestFileName = null;
var bookStructureXml = null;
var arrBookStructureEntries = null;
var arrPageXmlFiles = null;
var arrPageXmls = null;
var iPageXmlsLoaded = 0;

//variables filled during the creation of the manifest
var currentSequence = null;
var currentCanvas = null;
var currentImageFileName = null;
var currentAbsPageNum = null;
var currentStructureName = null;




//////////////////////////////
// PUBLIC METHODS           //
//////////////////////////////
function writeManifest(strBookName) {
  initMembers(strBookName);
  loadData();
  //TODO: write the manifest based on the book data
}


module.exports = {writeManifest};

//////////////////////////////////////////
// PRIVATE DATA INITIALIZATION METHODS  //
//////////////////////////////////////////
function initMembers(strBookName) {
  this.manifest = null;
  this.strBookName = strBookName;
  this.strManifestFileName = "manifest_" + strBookName + ".json";
  this.bookStructureXml = null;
  this.arrBookStructureEntries = null;
  this.arrPageXmlFiles = null;
  this.arrPageXmls = null;
  this.iPageXmlsLoaded = 0;

  this.currentSequence = null;
  this.currentCanvas = null;
  this.currentImageFileName = null;
  this.currentAbsPageNum = null;
  this.currentStructureName = null;

}

//initial loading of the data
function loadData() {
  var strBookPath = io.appendPath(conf.bookPath, this.strBookName);
  var strBookStructurePath = io.appendPath(strBookPath, conf.bookStructureFileName);
  io.getXmlContent(strBookStructurePath, setBookStructureXml);
  io.getFilesInDirectory(strBookPath, setPageFileNames);
}


function setBookStructureXml(err, xmlAsObject) {
  if (err) {
    return console.log(err);
  }

  this.bookStructureXml = xmlAsObject;
  this.arrBookStructureEntries = this.bookStructureXml["book:book"]["book:pages"][0]["book:structure"];
  //console.log(this.bookStructureXml);
  createManifest();
}

function setPageFileNames(err, arrFileNames) {
  if (err) {
    return console.log(err);
  }

  this.arrPageXmlFiles = arrFileNames;
  this.arrPageXmls = [];
  this.iPageXmlsLoaded = 0;
  for (var i = 0; i < this.arrPageXmlFiles.length; i++) {
    this.arrPageXmls.push(null);
  }

  var strBookPath = io.appendPath(conf.bookPath, this.strBookName);
  for (var i = 0; i < this.arrPageXmlFiles.length; i++) {
    var strFilePath = io.appendPath(strBookPath, this.arrPageXmlFiles[i]);
    io.getXmlContent(strFilePath, setPageXml);
  }
}

function setPageXml(err, xmlAsObject, strFileName) {
  if (err) {
    return console.log(err);
  }

  var index = getPageIndexFromFilename(strFileName);
  this.arrPageXmls[index] = xmlAsObject;
  this.iPageXmlsLoaded++;
  createManifest();
}

function getPageIndexFromFilename(strFileName) {
  var iFileCount = this.arrPageXmlFiles.length;
  for (var i = 0; i < iFileCount; i++) {
    var fileName = this.arrPageXmlFiles[i];
    if (strFileName.endsWith(fileName)) {
      return i;
    }
  }
  return -1;
}


function getPageFileName(abspagenum) {
  if (this.arrPageXmlFiles == null) return null;
  var iAbsPageNum = parseInt(abspagenum);
  if (isNaN(iAbsPageNum)) return null;

  var iFileCount = this.arrPageXmlFiles.length;
  for (var i = 0; i < iFileCount; i++) {
    var fileName = this.arrPageXmlFiles[i];
    var index = fileName.indexOf("_");
    if (index >= 0) {
      var numberPart = fileName.substring(index+1);
      numberPart = numberPart.replace(".xml", "");
      if (parseInt(numberPart) == iAbsPageNum) {
        return fileName;
      }
    }
  }
  return null;
}


/////////////////////////////////
// MANIFEST CREATION METHODS   //
/////////////////////////////////

function createManifest() {
  if (this.arrBookStructureEntries == null) return;
  if (this.arrPageXmlFiles == null) return;
  if (this.iPageXmlsLoaded != this.arrPageXmlFiles.length) return;
  //this.manifest = {label: "Manifest for img", sequences: "lol"};

  this.manifest = {
    label: conf.label, //TODO: book label
    "@type": "sc:Manifest",
    "@id": conf.manifestUrl+this.strManifestFileName,
    "@context": "http://iiif.io/api/presentation/2/context.json",
    "sequences": []
  };
  addSequenceToManifest();
  writeManifestToFile();
}

function addSequenceToManifest() {

  this.currentSequence = {
    "label" : "Current page order", // TODO: page id
    "@type" : "sc:Sequence",
    "@id" : conf.canvasUrl + "sequence/normal",
    "canvases" : []
  };


  //load the data based on the book structure
  //console.log(this.bookStructure);
  var count = this.arrBookStructureEntries.length;
  for (var i = 0; i < count; i++) {
    var bookPage = this.arrBookStructureEntries[i]["book:page"];
    this.currentStructureName = this.arrBookStructureEntries[i]["$"]["name"];
    //console.log(bookPage.length + " - " + strStructureName);
    var count2 = bookPage.length;
    for (var j = 0; j < count2; j++) {
      this.currentImageFileName = bookPage[j]["$"]["filename"];
      this.currentAbsPageNum = bookPage[j]["$"]["abspagenum"];
      addCanvasToSequence();
    }
  }


  this.manifest.sequences.push(this.currentSequence);
}

function addCanvasToSequence() {
  //TODO: width and heigth from image?
  var strPageFileName = getPageFileName(this.currentAbsPageNum);
  var iPageIndex = getPageIndexFromFilename(strPageFileName);
  console.log(strPageFileName + " -> " + iPageIndex);
  var pageXml = this.arrPageXmls[iPageIndex];
  console.log(pageXml["document"]["page"][0]["$"]["width"]);
  var iWidth = pageXml["document"]["page"][0]["$"]["width"];
  var iHeight = pageXml["document"]["page"][0]["$"]["height"];
  console.log(iWidth + " x " + iHeight);

  var strCanvasUrl = conf.canvasUrl + "canvas/canvas-" + this.currentAbsPageNum;
  this.currentCanvas = {
    height : iHeight,
    label : this.currentStructureName + "(Seite " + this.currentAbsPageNum + ")",
    width : iWidth,
    "@type" : "sc:Canvas",
    "@id" : strCanvasUrl
  };

  addImageToCanvas(strCanvasUrl, iWidth, iHeight);
  addThumnbnailToCanvas(iWidth, iHeight);
  this.currentSequence.canvases.push(this.currentCanvas);
}

function addImageToCanvas(strCanvasUrl, iWidth, iHeight) {
  var filename = this.currentImageFileName;
  if (filename.endsWith(".jpg")) filename = filename.replace(".jpg", ".tif");
  var strImageId = conf.imageUrl + this.strBookName + "/" + filename;
  var image = {
    "motivation" : "sc:painting",
    "on" : strCanvasUrl,
    "@type" : "oa:Annotation",
    "resource" : {
      "service" : {
        "profile" : "http://iiif.io/api/image/2/level1.json",
        "@context" : "http://iiif.io/api/image/2/context.json",
        "@id" : strImageId
      },
      "height" : iHeight,
      "width" : iWidth,
      "@id" : strImageId,
      "@type" : "dctypes:Image"
    }
  };

  this.currentCanvas.images = [image];
}

function addThumnbnailToCanvas(iWidth, iHeight) {
  var filename = this.currentImageFileName;
  if (filename.endsWith(".jpg")) filename = filename.replace(".jpg", ".tif");
  //var strImageId = conf.imageUrl + this.strBookName + "/" + filename;
  var strImageId = "http://localhost:9090/IIPImage.html?IIIF=" + this.strBookName + "/" + filename;

  var thumbnail = {
    //"@id" : strImageId + "/full/64,88/0/default.jpg",
    //"@id" : "http://localhost:9090/test.jpg",
    "@id" : strImageId,
    "@type" : "dctypes:Image",
    "profile": [
      "http://iiif.io/api/image/2/level0.json"
    ],
    "service" : {
      "@context" : "http://iiif.io/api/image/2/context.json",
      "protocol": "http://iiif.io/api/image",
      "@id" : strImageId,
      "height" : iHeight,
      "width" : iWidth,
    }

  };


  this.currentCanvas.thumbnail = thumbnail;
  //this.currentCanvas.thumbnail = strImageId + "/full/64,88/0/default.jpg";
  //this.currentCanvas.thumbnail = "http://localhost:9090/test.jpg";
  //this.currentCanvas.thumbnail = "http://localhost:9090/fcgi-bin/iipsrv.fcgi?FIF=AHB-01-AC15148377-0/AHB-01000-AC15148377-image-001-00.tif&WID=128&QLT=75&CVT=jpeg";
  //this.currentCanvas.thumbnail = "http://localhost:9090/IIPImage.html?IIIF=" + this.strBookName + "/" + filename;
}



////////////////////////////////////
// WRITING FILES METHODS          //
////////////////////////////////////
function writeManifestToFile() {
  var jsonContent = JSON.stringify(this.manifest, null, "  ");
  var strFileName = io.appendPath(conf.manifestPath, this.strManifestFileName);
  io.writeFile(strFileName, jsonContent);
}
