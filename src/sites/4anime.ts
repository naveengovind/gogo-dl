import {Anime} from '../models/Anime'
import chalk from 'chalk';
import got from 'got';
import {JSDOM} from "jsdom";
import {MetaData} from "../models/MetaData";
import site from "./site";

const BASE_URL = 'https://4anime.to';

export default class FourAnime implements site{

    async getAnimeMetaData(href: string): Promise<MetaData>
    {
        return await got(href).then(response => {
            const dom = new JSDOM(response.body);
            let epList: HTMLCollection = dom.window.document.getElementsByClassName('episodes range active').item(0)!.children
            let lastEp: string = epList.item(epList.length - 1)!.getElementsByTagName('a')!.item(0)!.textContent!
            return new MetaData(parseInt(lastEp))
        }).catch(() => {
            return new MetaData()
        });
    }

    async search(keyword: string): Promise<Array<Anime>>
    {
        let searchURL: string = BASE_URL + "/?s=" + keyword

        return await got(searchURL).then(response => {
            let results: Array<Anime> = []
            const dom = new JSDOM(response.body)
            let itemList = dom.window.document.querySelector('#app-mount > div > div > section > div.container')
            let items = itemList!.children
            for(let i:number = 1; i < items.length; i++)
            {
                let info_head = items.item(i)!.children.item(0)!.getElementsByTagName('a').item(0)!
                let href = (info_head.href)
                let img = (info_head.children.item(0)!.getAttribute('src'))!
                let name = (info_head.children.item(1)!.textContent)!
                let released = (info_head.children.item(2)!.textContent)
                results[i-1] = (new Anime(name, href, img, Number(released)))
            }
            return results
        }).catch(() => {
            return []
        });
    }

    async getVideoSrc(href: string, episode: number): Promise<string> {
        let url:string = href.replace('/anime', '') + "-episode-" + episode
        return await got(url).then(response => {
            const dom: JSDOM = new JSDOM(response.body);
            return dom.window.document.getElementsByTagName('source')!.item(0)!.getAttribute('src')!
        }).catch(() => {
            console.log(chalk.redBright('unable to find video URL'))
            process.exit(1)
        });
    }

}