import prompts = require("prompts");
const chalk = require("chalk");
import {dl as downloader} from "../commands/dl";
import {watch} from "../commands/watch";
import {watchList} from "../commands/watchList"
import {Anime} from "../models/Anime";
import {PromptObject} from "prompts";
import Gogoanime from "../sites/Gogoanime";
import site from "../sites/site";
import {STATUS} from "../utils/mal_utils";
import got from "got";
import NineAnime from "../sites/9anime";
import {utils} from "../utils/utils";
const SUPPORTED_SITES = ['Gogoanime','9anime']
let t_site = new Map<string,site>()
t_site.set("Gogoanime", new Gogoanime())
t_site.set("9anime", new NineAnime())

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
                        let ind_subs = {dub:undefined, sub:undefined, uncen:undefined}
                        if(site === 'Gogoanime'){
                            for(const key of slug_keys)
                            {
                                if(key.toLowerCase().endsWith('-uncensored')){
                                    ind_subs.uncen = res['Sites'][site][key]['url']
                                }else if(key.toLowerCase().endsWith('-dub')){
                                    ind_subs.dub = res['Sites'][site][key]['url']
                                }else{
                                    ind_subs.sub = res['Sites'][site][key]['url']
                                }
                            }
                        }else
                        {
                            if (slug_keys.length == 2)
                            {
                                if (res['Sites'][site][slug_keys[0]]['url'].toLowerCase().lastIndexOf('dub') > res['Sites'][site][slug_keys[1]]['url'].toLowerCase().lastIndexOf('dub'))
                                {
                                    ind_subs.dub = res['Sites'][site][slug_keys[0]]['url']
                                    ind_subs.sub = res['Sites'][site][slug_keys[1]]['url']
                                } else
                                {
                                    ind_subs.dub = res['Sites'][site][slug_keys[1]]['url']
                                    ind_subs.sub = res['Sites'][site][slug_keys[0]]['url']
                                }
                            }else
                                ind_subs.sub = res['Sites'][site][slug_keys[0]]['url']
                        }
                        sites.set(site,ind_subs)
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
        let choices: PromptObject = {
            type: 'select',
            name: 'value',
            message: 'Pick a show',
            choices: [],
            initial: 0,
        };

        if (cmd !== 'list' && cmd !== 'remove')
        {
            let i = 0
            for(const anime of await utils.getMal().search(title, {limit:15})){
                if(i >= 7)
                    break
                let opts = await this.mapIDToList(anime.node.id)
                if(opts.size > 0){
                    const intersected = Array.from(opts.keys()).filter(value => SUPPORTED_SITES.includes(value));
                    if(intersected.length > 0 && anime.node.start_season !== undefined && anime.node.start_season.year !== undefined)
                    {
                        options.push(new Anime(anime.node.title, opts, "", anime.node.start_season.year, anime.node.id))
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
            for(const anime of await utils.getMal().get_watch_list({status:STATUS.watching})){
                let opts = await this.mapIDToList(anime.node.id)
                if(opts.size > 0){
                    options.push(new Anime(anime.node.title, opts, "", anime.node.start_season.year, anime.node.id))
                }
            }
            if (cmd === 'list')
                cmd = title
        }

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
            await watchList.newShow(options[response.value].id)
        } else if (cmd === 'remove')
        {
            await watchList.removeShow(options[response.value].id)
        } else
        {
            await driver.execute(options[response.value], cmd, player)
        }

    },
    execute: async function (anime: Anime, type: string, player: string | undefined)
    {
        let rangeNum: { lower: number, upper: number }
        const intersected = Array.from(anime.href.keys()).filter(value => SUPPORTED_SITES.includes(value)).sort();
        let meta;
        let default_src = intersected[0]
        if(intersected.includes('Gogoanime'))
            default_src = 'Gogoanime'
        let watch_type = ''
        if(anime.href.get(default_src)!.dub !== undefined || anime.href.get(default_src)!.uncen !== undefined)
        {
            let options: PromptObject = {
                type: 'select',
                name: 'value',
                message: 'Pick an option',
                choices: [
                    {title: 'Subbed', value: 'sub'},
                ],
                initial: 0
            }

            if (anime.href.get(default_src)!.dub !== undefined)
                options.choices?.push({title: 'Dubbed', value: 'dub'})

            if (anime.href.get(default_src)!.uncen !== undefined)
                options.choices?.push({title: 'Uncensored', value: 'uncen'})

            const response = await prompts(options);

            if (response.value === 'uncen')
                watch_type = 'uncen'
            else if (response.value ==='dub')
                watch_type = 'dub'
            else
                watch_type = 'sub'
        }
        else
            watch_type = 'sub'

        if (watch_type === 'uncen')
            meta = await t_site.get(default_src)!.getMetaData(anime.href.get(default_src)!.uncen)
        else if (watch_type ==='dub')
            meta = await t_site.get(default_src)!.getMetaData(anime.href.get(default_src)!.dub)
        else
            meta = await t_site.get(default_src)!.getMetaData(anime.href.get(default_src)!.sub)

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
        }else if(meta.lastEpisode > 0){
             rangeNum = {lower:1, upper:1}
        }else{
            console.log(chalk.redBright('no episodes available'))
            process.exit(0)
        }

        if (type === 'dl')
        {
            await downloader.download(anime, rangeNum.lower, rangeNum.upper, watch_type)
        } else if (type === 'watch')
        {
            await watch.watch(anime, rangeNum.lower, rangeNum.upper, player, watch_type)
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
    getOptimizedPlayer: async function (anime: Anime, ep:number, type:string): Promise<string | undefined>{
        if(anime.href.get('Gogoanime')!== undefined){
            let temp: string | undefined
            let src: string = ''
            let back_up: string = ''
            for(const server of ['vidcdn', 'anime','xstreamcdn', 'streamtape'])
            {
                if (src === '' || src.endsWith('.m3u8'))
                {
                    temp = (await this.getUrl(anime, ep, type, "Gogoanime", server))
                    if (temp !== undefined)
                    {
                        back_up = temp!
                        if(!temp.endsWith('.m3u8')){
                            src = temp!
                        }
                    }
                }
            }
            if(src !== '')
                return src!

            else if(anime.href.get('9anime') !== undefined){
                temp = (await this.getUrl(anime, ep, type, "9anime", ''))
                if (temp !== undefined)
                    return temp!
            }
            return back_up!
        }

    },
    getUrl: async function (anime: Anime, ep:number, type:string, src:string, server:string): Promise<string | undefined> {
        if (type === 'uncen' && anime.href.get(src)!.uncen !== undefined)
            return await t_site.get(src)!.getVideoSrc(anime.href.get(src)!.uncen, ep, server)
        else if (type ==='dub' && anime.href.get(src)!.dub !== undefined)
            return await t_site.get(src)!.getVideoSrc(anime.href.get(src)!.dub, ep, server)
        else if(type ==='sub')
            return await t_site.get(src)!.getVideoSrc(anime.href.get(src)!.sub, ep, server)
        return undefined
    }
}