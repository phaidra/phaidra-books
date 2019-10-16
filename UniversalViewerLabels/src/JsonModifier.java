import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.OutputStreamWriter;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;

public class JsonModifier {

  private String _fileContent;

  public JsonModifier(String fileName) throws Exception {
    BufferedReader reader = new BufferedReader(new FileReader(fileName));
    String line = reader.readLine();
    _fileContent = "";
    while (line != null) {
      _fileContent += line + "\n";
      line = reader.readLine();
    }
    reader.close();
  }

  public void modifyJsonContent(TranslationTable translationTable) {
    if (translationTable == null) return;

    int entryNum = translationTable.getEntryNum();
    for (int i = 0; i < entryNum; i++) {
      replaceJsonValue(translationTable.getEntry(i));
    }
  }

  public void saveFile(String fileName) throws Exception {
    OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(fileName), StandardCharsets.UTF_8);
    writer.write(_fileContent);
    writer.close();
  }


  //////////////////////////////////
  // PRIVATE MODIFY METHODS       //
  //////////////////////////////////
  private void replaceJsonValue(TranslationTableEntry entry) {
    if (entry == null) return;

    StringRange stringRange = getStringRangeForEntry(entry);
    replaceValueOfStringRange(entry, stringRange);
  }


  private void replaceValueOfStringRange(TranslationTableEntry entry, StringRange stringRange) {
    if (entry == null) return;
    if (stringRange == null) return;

    String before = _fileContent.substring(0, stringRange.getStart());
    String after = _fileContent.substring(stringRange.getEnd()+1);
    _fileContent = before + "\"" + entry.getGerman() + "\"" + after;
  }

  private StringRange getStringRangeForEntry(TranslationTableEntry entry) {
    StringRange parentStringRange = getStringRangeOfParent(entry);
    return getStringRangeOfPropertyValue(entry, parentStringRange);
  }

  private StringRange getStringRangeOfParent(TranslationTableEntry entry) {
    String parent = entry.getParent();
    if (isEmpty(parent)) {
      return getDefaultStringRange();
    }

    int parentIndex = _fileContent.indexOf(parent);
    if (parentIndex < 0) return getDefaultStringRange();

    //"authDialogue":{"content":{"cancel":"Cancel","confirm":"Confirm"}}
    // value range is start and end index of {"content":{"cancel":"Cancel","confirm":"Confirm"}}
    int parentValueStart = _fileContent.indexOf("{", parentIndex);
    int parentValueEnd = parentValueStart+1;
    int openColumns = 0;
    int fileContentLength = _fileContent.length();
    for (int i = parentValueStart+1; i < fileContentLength; i++) {
      if (_fileContent.charAt(i) == '{') openColumns++;
      if (_fileContent.charAt(i) == '}') {
        openColumns--;
        if (openColumns < 0) {
          parentValueEnd = i;
          break;
        }
      }
    }

    return new StringRange(parentValueStart, parentValueEnd);


  }

  private StringRange getStringRangeOfPropertyValue(TranslationTableEntry entry, StringRange parentStringRange) {
    String property = "\"" + entry.getProperty() + "\":";
    int propertyIndex = _fileContent.indexOf(property, parentStringRange.getStart());
    if (propertyIndex < 0) return null;

    //"authDialogue":{"content":{"cancel":"Cancel","confirm":"Confirm"}}
    // property = "cancel":
    //value Range is index of "Cancel"
    // property = "confirm":
    //value Range is index of "Confirm"
    int propertyValueStart = _fileContent.indexOf(":", propertyIndex) + 1;
    int propertyValueEnd = _fileContent.indexOf("\"", propertyValueStart+1);
    return new StringRange(propertyValueStart, propertyValueEnd);

  }

  private boolean isEmpty(String value) {
    if (value == null) return true;
    if (value.trim().equals("")) return true;
    return false;
  }

  private StringRange getDefaultStringRange() {
    return new StringRange(0, _fileContent.length());
  }



}
