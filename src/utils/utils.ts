import prompts =  require("prompts");
import fs = require("fs");
const chalk = require("chalk");
import JikanTS from "jikants";
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
            fs.unlinkSync(utils.getConfigPath())
        process.exit(0)
    },
    getConfigPath(): string{
        return path.join(require('os').homedir(), '.gogoConfig.json')
    },

    async search(query: string): Promise<Array<string>>{
        let ret: Array<string> = []
        let results = (await JikanTS.Search.search(query, "anime", 1, { limit: 5 }))!.results
        results!.forEach(function (result) {
            ret.push(result.title)
        })
        return ret
    }
}