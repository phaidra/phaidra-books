public class StringRange {
  private int _start, _end;

  public StringRange(int start, int end) {
    _start = start;
    _end = end;
    performValueChecks();
  }



  public int getStart() {
    return _start;
  }

  public int getEnd() {
    return _end;
  }


  private void performValueChecks() {
    if (_start < 0) _start = 0;
    if (_end < 0) _end = 0;

    if (_end < _start) {
      int oldStart = _start;
      _start = _end;
      _end = oldStart;
    }
  }
}
