import prompts = require("prompts");
const chalk = require("chalk");
import {dl as downloader} from "../commands/dl";
import {watch} from "../commands/watch";
import {watchList} from "../commands/watchList"
import nconf  = require('nconf');
import {utils} from "../utils/utils";
import {Anime} from "../models/Anime";
import {PromptObject} from "prompts";
import Gogoanime from "../sites/Gogoanime";
import site from "../sites/site";

let t_site: site = new Gogoanime()

export let driver = {

   askForShow: async function (title: string, type: string, player:string){

       let options: Array<Anime>;
        if(type !== 'list' && type !== 'remove') {
            options = await t_site.search(title)
            if (options === null || options === undefined || options === []) {
                console.log(chalk.redBright('no results found for ') + chalk.yellow('keyword'))
                process.exit(0)
            }
        }else{
            try{
                nconf.use('file', {file: utils.getConfigPath()});
                nconf.load();
            }catch (e) {
                await utils.recreateConfig()
            }
            options = nconf.get('shows');
            if(type === 'list')
                type = title
        }
        let choices: PromptObject = {
            type: 'select',
            name: 'value',
            message: 'Pick a show',
            choices: [

            ],
            initial: 0,
        };

        for (let i = 0; i < options.length; i++) {
            choices!.choices!.push({title: options[i].name, description: '' + options[i].released, value: i})
        }

        console.log();

        const response = await prompts(choices);

        if(response.value === undefined)
            process.exit(0)

        else if(type === 'add') {
            await watchList.newShow(options[response.value])
        }
        else if(type === 'remove') {
            await watchList.removeShow(options[response.value])
        }
        else {
            await driver.execute(options[response.value], type, player)
        }

    },
     execute: async function(anime:Anime, type: string, player:string){

        let meta = await t_site.getAnimeMetaData(anime.href)

        console.log(`\nThere are ${chalk.magenta(meta.lastEpisode)} episodes`)

        let options: PromptObject = {
            type: 'text',
            name: 'value',
            message: `Episode range [1-${meta.lastEpisode}]`
        };

        let range = await prompts(options);
        let rangeStr: string = range.value

       /* if(range === undefined)
            process.exit(0)*/

        let rangeNum: {lower: number, upper: number} = this.getRangeFromString(rangeStr)

         if(type === 'dl') {
            console.log()
            await downloader.download(anime, rangeNum.lower, rangeNum.upper)
        }
        else if(type === 'watch')
            await watch.watch(anime, rangeNum.lower, rangeNum.upper, player)
    },

    getRangeFromString: function(range: string): {lower: number, upper: number}
    {
        let ind = range.indexOf('-')
        let lower: number
        let upper : number

        if (ind === undefined || ind === -1) {
            lower = Number(range.trim())
            upper = Number(range.trim())
        }
        else{
            lower = Number(range.substring(0, ind).trim())
            upper = Number(range.substring(ind+1).trim())
        }
        return {lower: lower, upper: upper}
    },

}