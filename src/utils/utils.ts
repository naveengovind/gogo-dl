import prompts =  require("prompts");
import fs = require("fs");
const chalk = require("chalk");
const path = require('path')
import https from "https";
import MyAnimeList from "./mal_utils";

let mal = new MyAnimeList("00d2c5d06cc8ec154ddd8c8c22ace667")

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
    getMal(){
        return mal
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