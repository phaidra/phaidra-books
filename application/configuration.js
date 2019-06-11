//configuration.js
//////////////////////////////
// PUBLIC METHODS           //
//////////////////////////////
module.exports = {
  manifestUrl: "http://localhost:9090/manifests/",
  manifestPath: "C:\\Apache24\\htdocs\\manifests",
  bookPath: "source",
  bookStructureFileName: "bookstructure.xml",
//  manifestPath: "target/",

  imageUrl: "http://localhost:9090/fcgi-bin/iipsrv.fcgi?IIIF=",
  //imageUrl: "http://localhost:9090/IIPImage.html?IIIF=",
  canvasUrl: "http://localhost:9090/fcgi-bin/",
  label: "Manifest for img"
};

//image url for testbook: http://localhost:9090/fcgi-bin/iipsrv.fcgi?IIIF=testbook/AHB-01000-AC15148377-image-001-00.tif/info.json
