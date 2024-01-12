#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import fs from "fs-extra";
import { fileURLToPath } from 'url';
import { modifyFiles, installVite,
        determineComponentFolder, fileModifier,
        parseNewComponentAnswers, copyGitignoreFile } from './utilities/helperFuncs.mjs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CWD = process.cwd();

program
  .command('new-project')
  .description('Create a new Jolt-UI project')
  .action(() => {
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'appName',
            message: 'Application name:'
        },
        {
            type: 'confirm',
            name: 'useRouter',
            message: 'Use router:'
        },
        {
            type: 'confirm',
            name: 'useAuthenticator',
            message: 'Use authenticator:',
            when: (answers) => answers.useRouter
        },
        {
            type: 'input',
            name: 'userRoleField',
            message: 'User role field:',
            when: (answers) => answers.useAuthenticator
        },
        {
            type: 'confirm',
            name: 'vite',
            message: 'Install Vite (recommended)? This will install Vite and Vite Top-Level Await'
        }
    ])
  .then(answers => {
      const destination = path.join(process.cwd());
      const projectType = answers.useRouter ? 'withRouter' : 'withoutRouter';
      fs.copySync(path.join(__dirname, 'starters', projectType), destination); //copy app folder
      fs.copySync(path.join(__dirname, 'starters', 'public'), path.join(destination, 'public')); //copy public folder
      const replacements = modifyFiles(answers, CWD);
      installVite(answers, __dirname, destination, replacements, CWD);
      copyGitignoreFile(__dirname, destination);
      console.log("Project setup finished.")
      if(answers.vite){
        console.log("INFO: run command 'npm run dev' to start your application with Vite.")
      }
      if(!answers.vite){
        console.log(`If you have opted not to use Vite, you are going to need another static server and bundler to develope and deploy your application.`);
      }
    });
  });


  program
  .command('new-component')
  .description('Create a new Jolt-UI component')
  .option('-p, --path <string>', 'New component path (relative to project directory)', '/src/app/components')
  .action((options) => {
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'componentName',
            message: 'Component name:'
        },
        {
            type: 'input',
            name: 'componentContainer',
            message: 'Component container:'
        },
        {
            type: 'input',
            name: 'dataField',
            message: 'Component data field:'
        }
    ])
  .then(answers => {
      const finalAnswers = parseNewComponentAnswers(answers, options);
      if(!finalAnswers){
        return;
      }
      const componentPath = determineComponentFolder(finalAnswers, CWD);
      if(!componentPath){
        return;
      }
      const destination = componentPath.destination;
      if(!destination){
        return;
      }
      fs.copySync(path.join(__dirname, 'starters', 'newComponent', 'newComponent.js'),
                  path.join(destination, `${finalAnswers.camelCaseName}.js`));
      fileModifier(finalAnswers, finalAnswers, CWD, [path.join(componentPath.currentDestination,
                                                              finalAnswers.camelCaseName,
                                                              `${finalAnswers.camelCaseName}.js`)]);
    });
  });




program.parse(process.argv);