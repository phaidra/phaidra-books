import java.util.Vector;

public class TranslationTable {
  private Vector<TranslationTableEntry> _entries;

  public TranslationTable() {
    _entries = new Vector<TranslationTableEntry>();
  }


  public void addEntry(TranslationTableEntry entry) {
    if (entry != null) {
      _entries.add(entry);
    }
  }

  public void clear() {
    _entries.clear();
  }

  public int getEntryNum() {
    return _entries.size();
  }

  public TranslationTableEntry getEntry(int index) {
    if (index < 0) return null;
    if (index >= _entries.size()) return null;
    return _entries.get(index);
  }
}
