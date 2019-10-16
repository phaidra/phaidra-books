public class TranslationTableEntry {

  private String _parent, _property, _english, _german;

  public TranslationTableEntry(String parent, String property, String english, String german) {
    _parent = parent;
    _property = property;
    _english = english;
    _german = german;
  }

  public String getParent() {
    return _parent;
  }

  public String getProperty() {
    return _property;
  }

  public String getGerman() {
    return _german;
  }
}
