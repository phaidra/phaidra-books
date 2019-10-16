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
var currentStructure = null;
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
  this.currentStructure = null;
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
    label: conf.bookTitle,
    "@type": "sc:Manifest",
    "@id": conf.manifestUrl+this.strManifestFileName,
    "@context": "http://iiif.io/api/presentation/2/context.json",
    "license": conf.license,
    "logo": conf.logo,
    "attribution": conf.attribution,
    "metadata": [],
    "sequences": [],
    "structures": []
  };
  addMetadataToManifest();
  addSequenceAndStructureToManifest();
  writeManifestToFile();
}


function addMetadataToManifest() {
  titleMetadata = {
    "label": "Title",
    "value": conf.bookTitle
  };
  this.manifest.metadata.push(titleMetadata);

  furtherInformation = {
    "label": "Further information",
    "value": conf.furtherInformation
  };
  this.manifest.metadata.push(furtherInformation);

  author = {
    "label": "Author(s)",
    "value": conf.author
  };
  this.manifest.metadata.push(author);

  publicationDate = {
    "label": "Publication date",
    "value": conf.publicationDate
  };
  this.manifest.metadata.push(publicationDate);


  permalinkBook = {
    "label": "Permalink zum Buch",
    "value": conf.permalinkBook
  };
  this.manifest.metadata.push(permalinkBook);

  permalinkPage = {
    "label": "Permalink zur aktuellen Seite",
    "value": conf.permalinkPage
  };
  this.manifest.metadata.push(permalinkPage);

  var tableOfContentsHtml = getTableOfContentsHtml();
  tableOfContents = {
    "label": "Table of contents",
    "value": tableOfContentsHtml
  };
  this.manifest.metadata.push(tableOfContents);

  var downloadsHtml = "<a href=''>komplettes Buch downloaden</a><br/>";
  downloadsHtml += "<a href=''>aktuelle Seite als JPG downloaden</a><br/>";
  downloadsHtml += "<a href=''>aktuelle Seite als PDF downloaden</a>";
  downloads = {
    "label": "Downloads",
    "value": downloadsHtml
  };
  this.manifest.metadata.push(downloads);
}

function getTableOfContentsHtml() {
  var tocHtml = "";
  var count = this.arrBookStructureEntries.length;
  for (var i = 0; i < count; i++) {
    var bookPage = this.arrBookStructureEntries[i]["book:page"];
    tocHtml += this.arrBookStructureEntries[i]["$"]["name"] + "<br/>";
  }
  //tocHtml += "</ul>";
  return tocHtml;
}


function addSequenceAndStructureToManifest() {


  this.currentSequence = {
    "label" : "Current page order", // TODO: page id
    "@type" : "sc:Sequence",
    "@id" : conf.canvasUrl + "sequence/normal",
    "rendering": [
        {
          "@id": conf.linkToPdf,
          "format": "application/pdf",
          "label": "Download as PDF"
        },
        {
          "@id": conf.linkToTxt,
          "format": "text/plain",
          "label": "Download raw text"
        }
    ],
    "viewingHint":	"paged",
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
    var strFirstCanvasUrl = "";
    for (var j = 0; j < count2; j++) {
      this.currentImageFileName = bookPage[j]["$"]["filename"];
      this.currentAbsPageNum = bookPage[j]["$"]["abspagenum"];
      var strCanvasUrl = addCanvasToSequence();
      if (j == 0) strFirstCanvasUrl = strCanvasUrl;
    }

    var strStructureUrl = conf.canvasUrl + "range/r-" + i;
    this.currentStructure = {
      "@id": strStructureUrl,
      "@type": "sc:Range",
      "label": this.currentStructureName, 
      "canvases": [
        strFirstCanvasUrl
      ]
    };
    this.manifest.structures.push(this.currentStructure);
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
  return strCanvasUrl;
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
