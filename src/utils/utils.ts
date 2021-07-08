import prompts =  require("prompts");
import fs = require("fs");
const chalk = require("chalk");
const path = require('path')
import got from 'got';
import https from "https";
export let utils = {

    async downloadAria2(): Promise<any>{
        const fs = require('fs');
        const file = fs.createWriteStream(path.join(path.dirname(this.getConfigPath()),'aria2c'));
        const request = https.get("https://github.com/naveengovind/gogo-dl/raw/typescript-migration/src/binary/darwin/aria2c", function(response:any) {
            response.pipe(file);
            file.on('finish', function() {
                file.close();  // close() is async, call cb after close completes.
            });
        });
        return file
    },

    async recreateConfig(){
        console.log(chalk.red('unable to open watch list file or file may be corrupt'));
        const response = await prompts({
            type: 'toggle',
            name: 'value',
            message: 'would you like to recreate the file?',
            initial: true,
            active: 'yes',
            inactive: 'no'
        });
        if(response.value)
            fs.rmSync(utils.getConfigPath())
        process.exit(0)
    },
    getConfigDirectory(): string{
        let conf: string
        if(process.platform.startsWith('win'))
            conf = path.join(require('os').homedir(), '%AppData%', 'Roaming', 'gogo-dl')
        else
            conf = path.join(require('os').homedir(),'.config','gogo-dl')
        if(fs.existsSync(conf)){
            return conf
        }else{
            fs.mkdirSync(path.dirname(conf), { recursive: true })
            return conf
        }
    },
    getConfigPath(): string{
        let conf: string = path.join(this.getConfigDirectory(), 'config.json')
        if(fs.existsSync(conf)){
            return conf
        }else{
            fs.writeFileSync(conf, '{}')
            return conf
        }
    },
}