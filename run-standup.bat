@echo off
REM Run the Jira Standup script and open the result in Notepad++

echo Running Jira Standup script...
docker-compose up

REM echo "Finished...opening file"

REM Get today's date components
for /f %%a in ('wmic os get localdatetime ^| find "."') do set dt=%%a
set YYYY=%dt:~0,4%
set MM=%dt:~4,2%
set DD=%dt:~6,2%

REM echo "Date: %YYYY% %MM% %DD%"

REM Construct the file path
set OUTPUT_FILE=dailies\%YYYY%\%MM%\%YYYY%%MM%%DD%_jira-tasks.md

REM echo "Output File: %OUTPUT_FILE%"

REM Check if file exists
if exist "%OUTPUT_FILE%" (
    REM Copy to clipboard using PowerShell (preserves UTF-8/emojis)
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$content = [System.IO.File]::ReadAllText('%OUTPUT_FILE%', [System.Text.Encoding]::UTF8); Set-Clipboard -Value $content"
    echo Copied to clipboard!
	
	REM Open in Notepad++
    echo Opening %OUTPUT_FILE% in Notepad++...
    start "" "C:\Program Files\Notepad++\notepad++.exe" "%OUTPUT_FILE%"
) else (
    echo Error: Output file not found at %OUTPUT_FILE%
    pause
)