import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import fs from "fs-extra";
import path from 'path';
import lodash from "lodash";

export function replacePlaceholdersInFile(filePath, replacements) {
    try {
        // Read the file
        const content = readFileSync(filePath, 'utf8');
        // Replace placeholders
        let newContent = content;
        for (const [placeholder, value] of Object.entries(replacements)) {
            const regex = new RegExp(`<${placeholder}>`, 'g');
            newContent = newContent.replace(regex, value);
        }
        // Write the file
        writeFileSync(filePath, newContent);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

export function parseAnswers(answers){
    const replacements = {
        "appName": answers.appName
    }
      
    replacements["authImport"] = `${answers.useAuthenticator ? 'import { Authenticator } from "jolt-ui";' : '//import authenticator here'}`;
    replacements["authInit"] = `${answers.useAuthenticator ? 'authenticator: new Authenticator({\n\t\tunauthenticatedRedirect: "index",\n\t\tauthenticatedRedirect: "dashboard",\n\t\tauthRoleField: "<userRoleField>"\n\t})' : '//initialize authenticator here'}`
    if(answers.useAuthenticator){
        replacements["userRoleField"] = answers.userRoleField
    }
    replacements["componentPath"] = `${answers.useRouter ? "src/app/components" : "src/components"}`
    replacements["appPath"] = `${answers.useRouter ? "src/app" : "src"}`
    replacements["viteLink"] = `${answers.vite ? '<li class="nav-item"><a class="nav-link" target="_blank" href="https://vitejs.dev/">Vite</a></li>' : ''}`
    return replacements;
}

export function fileModifier(answers, replacements, CWD, filePaths){
    for(let filePath of filePaths){
        let file = path.join(CWD, filePath);
        replacePlaceholdersInFile(file, replacements);
    }
}

export function modifyFiles(answers, CWD){
    const replacements = parseAnswers(answers);
    if(answers.useRouter){
        fileModifier(answers, replacements, CWD, ['src/app/init.js', 'src/app/components/menu/menu.js', 'index.html']);
    }
    else{
        fileModifier(answers, replacements, CWD, ['src/index.js', 'src/components/menu/menu.js', 'index.html']);
    }
    return replacements;
}

function modifyPackageJson(destination){
    const packageJsonPath = path.join(destination, 'package.json');
    try{
        const jsonFile = fs.readJSONSync(packageJsonPath);
        jsonFile.scripts = jsonFile.scripts || {};
        jsonFile.scripts.build = "vite build";
        jsonFile.scripts.dev = "vite";
        jsonFile.scripts.preview = "vite preview";
        return fs.writeJSONSync(packageJsonPath, jsonFile, {spaces: 2});
    }catch(error){
        console.log("Failed to modify package.json file.");
    }
}

export function copyGitignoreFile(__dirname, destination){
    fs.copySync(path.join(__dirname, 'starters', 'gitignore.txt'), path.join(destination, '.gitignore'));
}

export function installVite(answers, __dirname, destination, replacements, CWD){
    if(answers.vite){
        console.log("Installing Vite...");
        exec('npm install vite vite-plugin-top-level-await --save-dev', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return;
            }
            fs.copySync(path.join(__dirname, 'starters', 'vite.js'), path.join(destination, 'vite.config.mjs'));
            fileModifier(answers, replacements, CWD, ['vite.config.mjs']);
            modifyPackageJson(destination);
            console.log(`Vite installation completed: ${stdout}`);
        });
    }
}

export function determineComponentFolder(answers, CWD){
    const destinations = [
        answers.componentPath, //provided path. defaults to path for application with router
        '/src/components' //default path for application without router
    ]
    let index = 0;
    for(let currentDestination of destinations){
        if (fs.existsSync(path.join(CWD, currentDestination))) {
            const destination = path.join(CWD, currentDestination, answers.camelCaseName)
            fs.mkdirSync(destination);
            return {destination, currentDestination};
        }
        if(index === 0 && currentDestination !== '/src/app/components'){
            break;
        }
    }
    console.log("ERROR: Provided path for component does not exist.");
    return null;
}

export function parseNewComponentAnswers(answers, options){
    if(answers.componentName == ""){
        console.log("Component name must be a valid string (length > 0)");
        return null;
    }
    if(answers.dataField == ""){
        answers.dataField = "//add datafield here";
    }else{
        answers.dataField = `dataField: "${answers.dataField}"`;
    }
    const finalAnswers = { ...answers, componentPath: options.path };
    finalAnswers.camelCaseName = lodash.camelCase(finalAnswers.componentName);
    return finalAnswers;
}
