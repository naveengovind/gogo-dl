import prompts =  require("prompts");
import fs = require("fs");
const chalk = require("chalk");
const path = require('path')
import got from 'got';
export let utils = {

    async ping(url:string): Promise<boolean>{
        return await got(url).then(response => {
            return response.statusCode === 200;
        })
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

    getConfigPath(): string{
        let conf: string
        if(process.platform.startsWith('win'))
            conf =  path.join(require('os').homedir(), 'AppData', 'Roaming', 'gogo-dl', 'config.json')
        else
             conf = path.join(require('os').homedir(),'.config','gogo-dl','config.json')
        if(fs.existsSync(conf)){
            return conf
        }else{
            fs.mkdirSync(path.dirname(conf), { recursive: true })
            fs.writeFileSync(conf, '{}')
            return conf
        }
    },
}