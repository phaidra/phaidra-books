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

  //TODO: metadata -> extract from metadata files
  //TODO: license directly translated to link: eg. https://creativecommons.org/licenses/by-nc/4.0/
  license: "Lizenz Information: CC BY-NC 2.0 AT - Creative Commons Namensnennung - Keine kommerzielle Nutzung 2.0 Österreich",
  bookTitle: "Beitrag zur deutschen Mythologie und Sittenkunde aus dem Volksleben der Deutschen in Ungern",
  furtherInformation: "als Aufmunterung zu größeren Sammlungen in den deutschen Gegenden Ungerns. Presburg, Wigand in Comm. 1855. 40 S. bibliografische Angaben",
  author: "Unknown author",
  publicationDate: "1980",
  permalinkBook: "<a href='http://phaidra.univie.ac.at/o:912811'>http://phaidra.univie.ac.at/o:912811</a>",
  permalinkPage: "<a href='http://phaidra.univie.ac.at/o:912812'>http://phaidra.univie.ac.at/o:912812</a>",
  linkToPdf: "http://my.pdf.link",
  linkToTxt: "http://my.txt.link",
  attribution: "My copyright text",
  logo: "http://localhost:9090/favicon.png"
};

//image url for testbook: http://localhost:9090/fcgi-bin/iipsrv.fcgi?IIIF=testbook/AHB-01000-AC15148377-image-001-00.tif/info.json
