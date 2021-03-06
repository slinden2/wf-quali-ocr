@ECHO off
TITLE WF-QUALI-OCR
ECHO 1=quali 2=race 3=race w/ points 4=event
SET /p choice= "Please select one of the above options: " 
ECHO Getting results...
node .\index.js %choice%
ECHO Done. The results are in the results.txt or event_results.txt file.
ping 127.0.0.1 -n 6 > nul