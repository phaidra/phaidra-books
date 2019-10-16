"C:\Program Files\Java\jdk1.8.0_152\bin\javac"  src/*.java


xcopy /Y src\*.class build\

del src\*.class

pause