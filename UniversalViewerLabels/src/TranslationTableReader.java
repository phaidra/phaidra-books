import java.io.BufferedReader;
import java.io.FileReader;

public class TranslationTableReader {

  private String _csvFile;
  private TranslationTable _translationTable;

  public TranslationTableReader(String csvFile) {
    _csvFile = csvFile;
    _translationTable = new TranslationTable();
  }


  public TranslationTable getTranslationTable() throws Exception {
    readTranslationTable();

    return _translationTable;
  }

  private void readTranslationTable() throws Exception {
    _translationTable.clear();
    BufferedReader reader = new BufferedReader(new FileReader(_csvFile));
    String line = reader.readLine();
    int rowId = 1;
    while (line != null) {
      addTranslationTableEntry(line, rowId);
      rowId++;
      line = reader.readLine();
    }
    reader.close();
  }


  private void addTranslationTableEntry(String line, int rowId) throws Exception {
    if (rowId == 1) return; //avoid header

    String[] entries = line.split(";");
    if (entries.length < 4) throw new Exception("Invalid number of columns in row " + rowId);

    TranslationTableEntry entry = new TranslationTableEntry(entries[0], entries[1], entries[2], entries[3]);
    _translationTable.addEntry(entry);
  }

}
