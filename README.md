## 1. Pre-Requisite

- Dowload and Install Node (any version above 20) [Download Link](https://nodejs.org/en/download)
- install Vscode [Dowload Link](https://code.visualstudio.com)
- install Git [Download Link](https://git-scm.com/install/windows)

## 2. Clone Project

- Open VsCode
- Open Terminal and write this command `git clone [Repository URL]`
- Once the project is cloned, change the branch to 'master' from bottom Left icon in VS Code

## 3. Install Dependencies

- In the VsCode, open Terminal 
- Run `npm i` command to install the project Dependencies
- Run `npx playwright install` command to install the Automation browsers dependencies

## 4. Run Helper files

Steps To Execute helper files from Terminal

- In the VsCode, open Terminal 
- Run `node [File Path]` command to run the helper files
- make sure the File path is as per the Opened Terminal

## 5. Run Test Scripts

- In the VsCode, open Terminal
- To Execute All the Tests, run `npx playwright install --workers=1` this command will Execute All the scripts one by one.
- To Execute only one specific script, make sure to mark the Test as `'only'` and then run `npx playwright install`
- To Execute only one specific group of scripts, make sure to mark the 'Desribe' as `'only'` and then run `npx playwright install --workers=1`. this will run all group scenarios one by one.


