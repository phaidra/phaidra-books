import java.io.File;

public class UniversalViewerLabels {


  private static final String JSON_SOURCE_FOLDER = "source";
  private static final String JSON_TARGET_FOLDER = "target";
  private static final String[] JSON_SOURCE_FILES = {
    "uv-av-extension.en-GB.config.json",
    "uv-default-extension.en-GB.config.json",
    "uv-mediaelement-extension.en-GB.config.json",
    "uv-pdf-extension.en-GB.config.json",
    "uv-seadragon-extension.en-GB.config.json",
    "uv-virtex-extension.en-GB.config.json"
  };

  public static void main(String[] args) throws Exception {
    System.out.println("1. Load translation table in csv format");
    TranslationTableReader reader = new TranslationTableReader("TranslationTable.csv");
    TranslationTable translationTable = reader.getTranslationTable();
    System.out.println(translationTable.getEntryNum() + " entries loaded!\n");


    System.out.println("2. Load the English en-GB.config.json files and generate German versions");



    for (int i = 0; i < JSON_SOURCE_FILES.length; i++) {
      String sourceFileName = JSON_SOURCE_FILES[i];
      String targetFileName = sourceFileName.replace(".en-GB.", ".ge-GE.");
      JsonModifier jsonModifier = new JsonModifier(JSON_SOURCE_FOLDER + File.separator + sourceFileName);
      System.out.println("2." + (i+1) + ". " + sourceFileName + " loaded.");

      jsonModifier.modifyJsonContent(translationTable);
      System.out.println("2." + (i+1) + ". content for German file generated.");

      jsonModifier.saveFile(JSON_TARGET_FOLDER + File.separator + targetFileName);
      System.out.println("2." + (i+1) + ". " + targetFileName + " saved.\n");
    }
  }

}
