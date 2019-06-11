// utilities.js
var fs = require("fs"); //file system
var xml2js = require("xml2js"); //xml parser + builder




//////////////////////////////
// PUBLIC METHODS           //
//////////////////////////////
//TODO: not adapted to project yet
function createTmpFile(strFileName, callback) {
  var strTmpFileName = getTmpFileName(strFileName)
  copyFile(strFileName, strTmpFileName, callback);
  deleteOldTmpFiles(); //delete files older than 7 days
}

function getXmlContent(strFileName, callback) {
  var xml = fs.readFileSync(strFileName);
  xml2js.parseString(xml, function (err, result) {
    if (err) {
      console.error(err);
      if (typeof callback !== 'undefined') {
        return callback(err);
      }
      else {
        return;
      }

    }
    else {
      var strMessage = strFileName + " xml content read!";
      console.log(strMessage);
      if (typeof callback !== 'undefined') {
        callback(null, result, strFileName);
      }
    }
  });
}

function getFilesInDirectory(strDirectory, callback) {
  fs.readdir(strDirectory, function(err, files) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    callback(null, files);
  });
}

function saveXml(strFileName, xmlContent) {
  var builder = new xml2js.Builder();
  var strContent = builder.buildObject(xmlContent);

  fs.writeFile(strFileName, strContent, function(err) {
    if (err) {
       return console.error(err);
    }
    else {
      console.log(strFileName + " written!");
    }
  });
}




function appendPath(strPath, strFileName) {
  if (isEmpty(strPath)) return strFileName;
  if (!strPath.endsWith("/")) strPath += "/";
  return strPath + strFileName;
}

function writeFile(fileName, fileContent, response, callback) {
  fs.writeFile(fileName, fileContent, function(err) {
    if (err) {
       if (!isEmpty(callback)) {
         return callback(err);
       }
       return err;
    }
    else {
      console.log(fileName + " written!");
      if (!isEmpty(response)) {
        response.write(fileName + " successfully written!\n");
      }

      if (!isEmpty(callback)) {
        return callback(null, response);
      }

    }
  });

}


function isDirectory(strPath) {
  return fs.lstatSync(strPath).isDirectory();
}

//TODO: move this into dataUtilities
function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'undefined') return true;
  return false;
}




module.exports = {
  createTmpFile,
  getXmlContent,
  getFilesInDirectory,
  saveXml,
  appendPath,
  writeFile,
  isEmpty,
  isDirectory
};

/////////////////////////////////
// PRIVATE METHODS             //
/////////////////////////////////
//TODO: not adapted to project yet
var getTmpFileName = function(strFileName) {
  var strPureFileName = strFileName;
  if (strPureFileName.indexOf("/") >= 0) {
    strPureFileName = strPureFileName.substring(strPureFileName.lastIndexOf("/")+1);
  }
  var strTmpFileName = "tmp/" + strPureFileName + "_";

  strTmpFileName += getTimestampString(new Date());

  return getSourceFileName(strProjectRoot, strTmpFileName);
}

var copyFile = function(strSourceFileName, strTargetFileName, callback) {
  fs.writeFile(strTargetFileName, fs.readFileSync(strSourceFileName), function(err) {
    if (err) {
      console.error(err);
      if (typeof callback !== 'undefined') {
        return callback(err);
      }
      else {
        return;
      }

    }
    else {
      var strMessage = strTargetFileName + " created!";
      console.log(strMessage);
      if (typeof callback !== 'undefined') {
        callback(null);
      }
    }
  });

}

//TODO: not adapted to project yet
function deleteOldTmpFiles(strProjectRoot) {
  var strFolder = getSourceFileName(strProjectRoot, "tmp");
  fs.readdir(strFolder, function(err, files) {
    if (err) {
      return console.log(err);
    }
    files.forEach(function(file) {
      if (isTmpFileTooOld(file)) {
        fs.unlink(strFolder + "/" + file, function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("Tmp file " + file + " deleted!");
        });
      }
    });
  });

}

function isTmpFileTooOld(file) {

  var date = new Date();
  date.setDate(date.getDate()-7);
  var strTimestamp = getTimestampString(date);
  try {
    var iTimestamp = parseInt(strTimestamp);
    var iFileTimestamp = parseInt(file.substring(file.indexOf("_")+1));
    return iFileTimestamp < iTimestamp;
  }
  catch (e) {
    return false;
  }


}

function getTimestampString(date) {
  var strTimestamp = date.getFullYear();
  var arrComponents = [date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
  for (i = 0; i < arrComponents.length; i++) {
    if (arrComponents[i] < 10) strTimestamp += "0";
    strTimestamp += arrComponents[i];
  }
  return strTimestamp;
}
