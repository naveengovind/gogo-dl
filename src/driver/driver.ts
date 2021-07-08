import prompts = require("prompts");
const chalk = require("chalk");
import {dl as downloader} from "../commands/dl";
import {watch} from "../commands/watch";
import {watchList} from "../commands/watchList"
import {utils} from '../utils/utils'
import {Anime} from "../models/Anime";
import {PromptObject} from "prompts";
import Gogoanime from "../sites/Gogoanime";
import site from "../sites/site";
import MyAnimeList, {STATUS} from "../utils/mal_utils";
import got from "got";
import ConfigFile from "../utils/ConfigFile";
import GogoanimePup from "../sites/Gogoanime-pup";
import NineAnime from "../sites/9anime";
const SUPPORTED_SITES = ['Gogoanime','9anime']
let t_site = new Map<string,site>()
t_site.set("Gogoanime", new GogoanimePup())
t_site.set("9anime", new NineAnime())

let mal = new MyAnimeList("00d2c5d06cc8ec154ddd8c8c22ace667")

export let driver = {
    mapIDToList: async function(id: number){
        try
        {
            let response = await got('https://api.malsync.moe/mal/anime/' + id)
            if (response.statusCode === 200 && response.body !== 'Not found in the fire')
            {
                let res = JSON.parse(response.body)
                if (res['Sites'] !== undefined)
                {
                    let sites = new Map()
                    for (const site of Object.keys(res['Sites']))
                    {
                        let slug_keys = Object.keys(res['Sites'][site])
                        if (slug_keys.length > 1)
                        {
                            if (res['Sites'][site][slug_keys[0]]['url'].toLowerCase().indexOf('dub') > res['Sites'][site][slug_keys[1]]['url'].toLowerCase().indexOf('dub'))
                            {
                                sites.set(site, {
                                    sub: res['Sites'][site][slug_keys[1]]['url'],
                                    dub: res['Sites'][site][slug_keys[0]]['url']
                                })
                            } else
                            {
                                sites.set(site, {
                                    sub: res['Sites'][site][slug_keys[0]]['url'],
                                    dub: res['Sites'][site][slug_keys[1]]['url']
                                })
                            }
                        }
                        else if (slug_keys.length == 1)
                            sites.set(site, {sub: res['Sites'][site][slug_keys[0]]['url'], dub: undefined})
                    }
                    return sites
                }else
                    return new Map()
            }else
                return new Map()
        }catch (e)
        {
            return new Map()
        }
    },
    askForShow: async function (title: string, cmd: string, player: string | undefined)
    {
        let options: Array<Anime> = [];
        if (cmd !== 'list' && cmd !== 'remove')
        {
            let i = 0
            for(const anime of await mal.search(title, {limit:15})){
                if(i >= 10)
                    break
                let opts = await this.mapIDToList(anime.node.id)
                if(opts.size > 0){
                    const intersected = Array.from(opts.keys()).filter(value => SUPPORTED_SITES.includes(value));
                    if(intersected.length > 0 && anime.node.start_season !== undefined && anime.node.start_season.year !== undefined)
                    {
                        options.push(new Anime(anime.node.title, opts, "", anime.node.start_season.year))
                        i += 1
                    }
                }
            }
            if (options.length === 0)
            {
                console.log(chalk.redBright('no results found for search term ') + chalk.yellow(`${title}`))
                process.exit(0)
            }
        } else
        {
            for(const anime of await mal.get_watch_list({status:STATUS.watching})){
                let opts = await this.mapIDToList(anime.node.id)
                if(opts.size > 0){
                    options.push(new Anime(anime.node.title, opts, "", anime.node.start_season.year))
                }
            }
            if (cmd === 'list')
                cmd = title
        }
        let choices: PromptObject = {
            type: 'select',
            name: 'value',
            message: 'Pick a show',
            choices: [],
            initial: 0,
        };

        for (let i = 0; i < options!.length; i++)
        {
            choices!.choices!.push({title: options[i].name, description: '' + options[i].released, value: i})
        }

        console.log();

        const response = await prompts(choices);

        if (response.value === undefined)
            process.exit(0)

        else if (cmd === 'add')
        {
            await watchList.newShow(options[response.value])
        } else if (cmd === 'remove')
        {
            await watchList.removeShow(options[response.value])
        } else
        {
            await driver.execute(options[response.value], cmd, player)
        }

    },
    execute: async function (anime: Anime, type: string, player: string | undefined)
    {
        let rangeNum: { lower: number, upper: number }
        const intersected = Array.from(anime.href.keys()).filter(value => SUPPORTED_SITES.includes(value));
        let meta;
        let url = ''
        if(anime.href.get(intersected[0])!.dub !== undefined)
        {
            const response = await prompts({
                type: 'toggle',
                name: 'value',
                message: 'sub or dub?',
                initial: true,
                active: 'sub',
                inactive: 'dub'
            });
            if (response.value)
                url = anime.href.get(intersected[0])!.sub
            else
                url = anime.href.get(intersected[0])!.dub
        }else
            url = anime.href.get(intersected[0])!.sub
        meta = await t_site.get(intersected[0])!.getMetaData(url)
        if (meta.lastEpisode !== 1)
        {
            console.log(`\nThere are ${chalk.magenta(meta.lastEpisode)} episodes`)

            let options: PromptObject = {
                type: 'text',
                name: 'value',
                message: `Episode range [1-${meta.lastEpisode}]`
            };

            let range = await prompts(options);
            let rangeStr: string = range.value

            rangeNum = this.getRangeFromString(rangeStr)

            if (rangeNum.lower > rangeNum.upper)
            {
                rangeNum = {lower:rangeNum.upper, upper:rangeNum.lower}
            }
        }else{
             rangeNum = {lower:1, upper:1}
        }
        if (type === 'dl')
        {
            console.log()
            await downloader.download({href: url, name: anime.name}, rangeNum.lower, rangeNum.upper)
        } else if (type === 'watch')
        {
            await watch.watch({href: url, name: anime.name}, rangeNum.lower, rangeNum.upper, player)
        }
    },

    getRangeFromString: function (range: string): { lower: number, upper: number }
    {
        let ind = range.indexOf('-')
        let lower: number
        let upper: number

        if (ind === undefined || ind === -1)
        {
            lower = parseInt(range.trim())
            upper = parseInt(range.trim())
        } else
        {
            lower = parseInt(range.substring(0, ind).trim())
            upper = parseInt(range.substring(ind + 1).trim())
        }
        return {lower: lower, upper: upper}
    },

}