@echo off

REM Setting up environment
call npm install
call npx playwright install

REM 1 Executing Dashboard Events and Register Org
call npx playwright test --workers=1

REM Define source and destination
set "report_src=%cd%\playwright-report"
set "report_dest=C:\B2B-PlaywrightReports\B2B"
mkdir "%report_dest%"
REM Move report folder
xcopy "%report_src%" "%report_dest%" /E /I /Y




@REM REM 2 Executing Payment Exemption and Arabic Field Scenarios
@REM call npx playwright test src/tests/Applications/A1-PaymentExemption src/tests/Applications/Arabic_Fields --workers=2

@REM REM Define source and destination
@REM set "report_src=%cd%\playwright-report"
@REM set "report_dest=C:\B2B-PlaywrightReports\A1_PaymentExemption_ArabicFields"
@REM mkdir "%report_dest%"
@REM REM Move report folder
@REM xcopy "%report_src%" "%report_dest%" /E /I /Y




@REM REM 3 Executing Bulk upload
@REM call npx playwright test src/tests/Applications/BulkUpload --workers=1

@REM REM Define source and destination
@REM set "report_src=%cd%\playwright-report"
@REM set "report_dest=C:\B2B-PlaywrightReports\Bulk_Upload"
@REM mkdir "%report_dest%"
@REM REM Move report folder
@REM xcopy "%report_src%" "%report_dest%" /E /I /Y




@REM REM 4 Executing New Applications Approved
@REM call npx playwright test src/tests/Applications/NewApplication-Approved --workers=1

@REM REM Define source and destination
@REM set "report_src=%cd%\playwright-report"
@REM set "report_dest=C:\B2B-PlaywrightReports\Approved_Application"
@REM mkdir "%report_dest%"
@REM REM Move report folder
@REM xcopy "%report_src%" "%report_dest%" /E /I /Y




@REM REM 5 Executing New Applications Rejected With Reason
@REM call npx playwright test src/tests/Applications/NewApplication-Rejected-With-Reason --workers=1

@REM REM Define source and destination
@REM set "report_src=%cd%\playwright-report"
@REM set "report_dest=C:\B2B-PlaywrightReports\Rejected_With_Reasons"
@REM mkdir "%report_dest%"
@REM REM Move report folder
@REM xcopy "%report_src%" "%report_dest%" /E /I /Y




@REM REM 6 Executing New Applications Rejected Without Reason 
@REM call npx playwright test src/tests/Applications/NewApplication-Rejected-Without-Reason --workers=1

@REM REM Define source and destination
@REM set "report_src=%cd%\playwright-report"
@REM set "report_dest=C:\B2B-PlaywrightReports\Rejected_Without_Reasons"
@REM mkdir "%report_dest%"
@REM REM Move report folder
@REM xcopy "%report_src%" "%report_dest%" /E /I /Y




@REM REM 7 Executing New Applications Update Status
@REM call npx playwright test src/tests/Applications/NewApplication-Update-Status --workers=1

@REM REM Define source and destination
@REM set "report_src=%cd%\playwright-report"
@REM set "report_dest=C:\B2B-PlaywrightReports\UpdateStatus"
@REM mkdir "%report_dest%"
@REM REM Move report folder
@REM xcopy "%report_src%" "%report_dest%" /E /I /Y