var http = require("http"); //http server
var fs = require("fs"); //file system
var url = require("url"); //url helpers
var xml2js = require("xml2js"); //xml parser + builder
//tabula rasa demo: https://runkit.com/sdellis/tabula-rasa-usage




//project imports
var xmlModifier = require("./xmlModifier");
//var utilities = require("./utilities");
var io = require("./ioUtilities");
var conf = require("./configuration");
var manifest = require("./manifest");
var iFileWritten = 0;


http.createServer(function (request, response) {
   // Send the HTTP header
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {'Content-Type': 'text/plain'});

   var strLink = "http://localhost:4444/examples/uv/uv.html#?manifest=http://localhost:9090/manifests/manifest_AHB-01-AC15148377-0.json";
   var strResponse = "<a href='" + strLink + "' target='_blank'>Open Link</a>";

   response.write(strResponse);

   //TODO:
   // clean up main class
   io.getFilesInDirectory(conf.bookPath, processBooks);
   //manifest.writeManifest("manifest3.json");

   response.end();

/*
   var q = url.parse(request.url, true).query;
   var strSourceFileName = "source/" + q.source;
   var strTargetFileName = "target/" + q.target;

   response.write("Try to parse and modify file " + strSourceFileName + ".\n");
   response.write("Result is written to " + strTargetFileName + ".\n");

   try {
     var data = fs.readFileSync(strSourceFileName, function(err) {
       if (err) throw err;
     });

     xml2js.parseString(data, function (err, result) {
        if (err) throw err;
        //console.dir( result);
        var result = xmlModifier.modifyXmlObject(result);
        var builder = new xml2js.Builder();
        var xmlContent = builder.buildObject(result);
        var jsonContent = JSON.stringify(result, null, "  ");
        utilities.writeFile(strTargetFileName, xmlContent, response, fileWritten);
        utilities.writeFile(strTargetFileName + ".json", jsonContent, response, fileWritten);
        //response.end(); //won't work because of asynchronous IO calls

      });


   }
   catch (err) {
     console.log(err);
     response.write("Please make sure that the url parameters source and target are provided.\n");
     response.end("[ERROR] " + err);
   }
   */
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');

function fileWritten(err, response) {
  if (err) {
    response.write(err);
    response.end();
  }
  iFileWritten++;
  if (iFileWritten == 2) {
    response.end();
  }

};

function processBooks(err, bookDirectories) {
  for (var i = 0; i < bookDirectories.length; i++) {
    var strBook = bookDirectories[i];
    var strPath = io.appendPath(conf.bookPath, strBook);
    if (io.isDirectory(strPath)) {
      manifest.writeManifest(strBook);
    }
  }
}
