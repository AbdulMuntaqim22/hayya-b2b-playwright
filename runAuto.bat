@echo off

REM Setting up environment
call npm install
call npx playwright install

REM 1 Executing Dashboard Events and Register Org
call npx playwright test src/tests/RegisterOrganization src/tests/Events src/tests/Dashboard --workers=3

REM Define source and destination
set "report_src=%cd%\playwright-report"
set "report_dest=C:\B2B-PlaywrightReports\Dash_Even_RegisterOrg"
mkdir "%report_dest%"
REM Move report folder
xcopy "%report_src%" "%report_dest%" /E /I /Y




REM 2 Executing Payment Exemption and Arabic Field Scenarios
call npx playwright test src/tests/Applications/A1-PaymentExemption src/tests/Applications/Arabic_Fields --workers=2

REM Define source and destination
set "report_src=%cd%\playwright-report"
set "report_dest=C:\B2B-PlaywrightReports\A1_PaymentExemption_ArabicFields"
mkdir "%report_dest%"
REM Move report folder
xcopy "%report_src%" "%report_dest%" /E /I /Y




REM 3 Executing Bulk upload
call npx playwright test src/tests/Applications/BulkUpload --workers=1

REM Define source and destination
set "report_src=%cd%\playwright-report"
set "report_dest=C:\B2B-PlaywrightReports\Bulk_Upload"
mkdir "%report_dest%"
REM Move report folder
xcopy "%report_src%" "%report_dest%" /E /I /Y




REM 4 Executing New Applications Approved
call npx playwright test src/tests/Applications/NewApplication-Approved --workers=1

REM Define source and destination
set "report_src=%cd%\playwright-report"
set "report_dest=C:\B2B-PlaywrightReports\Approved_Application"
mkdir "%report_dest%"
REM Move report folder
xcopy "%report_src%" "%report_dest%" /E /I /Y




REM 5 Executing New Applications Rejected With Reason
call npx playwright test src/tests/Applications/NewApplication-Rejected-With-Reason --workers=1

REM Define source and destination
set "report_src=%cd%\playwright-report"
set "report_dest=C:\B2B-PlaywrightReports\Rejected_With_Reasons"
mkdir "%report_dest%"
REM Move report folder
xcopy "%report_src%" "%report_dest%" /E /I /Y




REM 6 Executing New Applications Rejected Without Reason 
call npx playwright test src/tests/Applications/NewApplication-Rejected-Without-Reason --workers=1

REM Define source and destination
set "report_src=%cd%\playwright-report"
set "report_dest=C:\B2B-PlaywrightReports\Rejected_Without_Reasons"
mkdir "%report_dest%"
REM Move report folder
xcopy "%report_src%" "%report_dest%" /E /I /Y




REM 7 Executing New Applications Update Status
call npx playwright test src/tests/Applications/NewApplication-Update-Status --workers=1

REM Define source and destination
set "report_src=%cd%\playwright-report"
set "report_dest=C:\B2B-PlaywrightReports\UpdateStatus"
mkdir "%report_dest%"
REM Move report folder
xcopy "%report_src%" "%report_dest%" /E /I /Y