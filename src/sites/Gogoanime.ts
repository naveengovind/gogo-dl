import {Anime} from '../models/Anime'
import chalk from 'chalk';
import got from 'got';
import {JSDOM} from "jsdom";
import {MetaData} from "../models/MetaData";
import site from "./site";

const BASE_URL = 'https://www2.gogoanime.sh';

export default class gogoanime implements site{

    async getAnimeMetaData(href: string): Promise<MetaData>
    {
        let url = BASE_URL + href
        return await got(url).then(response => {
            const dom = new JSDOM(response.body);
            let epList: HTMLCollection = dom.window.document.getElementById('episode_page')!.children
            let lastEp: string | null = epList.item(epList.length - 1)!.getElementsByTagName('a').item(0)!.getAttribute('ep_end')
            return new MetaData(Number(lastEp))
        }).catch(() => {
            return new MetaData()
        });
    }

    async search(keyword: string): Promise<Array<Anime>>
    {
        let searchURL: string = BASE_URL + "//search.html?keyword=" + keyword

        return await got(searchURL).then(response => {
            let results: Array<Anime> = []
            const dom = new JSDOM(response.body)
            let itemList = dom.window.document.getElementsByClassName('items')

            let items = itemList.item(0)!.children

            for(let i:number = 0; i < items.length; i++)
            {
                let href = (items.item(i)!.getElementsByClassName('name').item(0)!.getElementsByTagName('a').item(0)!.href)
                let name = (items.item(i)!.getElementsByClassName('name').item(0)!.getElementsByTagName('a').item(0)!.title)
                let img = (items.item(i)!.getElementsByClassName('img').item(0)!.getElementsByTagName('a').item(0)!.getElementsByTagName('img').item(0)!.src)
                let released = (items.item(i)!.getElementsByClassName('released').item(0)!.textContent)
                released = released!.substring(released!.indexOf(': ') + 2).trim()
                results[i] = (new Anime(name, href, img, Number(released)))
            }
            return results
        }).catch(() => {
            return []
        });
    }

    private async getVidStreamURL(href: string, episode: number): Promise<string | null>
    {
        let url:string = BASE_URL + '/' + href.substring(href.lastIndexOf('/')+1)+ "-episode-" + episode
        return await got(url).then(response => {

            const dom: JSDOM = new JSDOM(response.body);
            return dom.window.document.getElementsByClassName('vidcdn').item(0)!
                .getElementsByTagName('a').item(0)!.getAttribute('data-video')

        }).catch(() => {
            console.log(chalk.redBright('unable to find video URL'))
            process.exit(1)
        });

    }

     async getVideoSrc(href: string, episode: number): Promise<string> {
        let url = 'https://' + await this.getVidStreamURL(href, episode)
        return await got(url).then(response => {
            const dom:JSDOM = new JSDOM(response.body);
            let script : string | null = dom.window.document.querySelector('body > div > div > script')!.textContent;
            let index1:number = script!.indexOf('playerInstance.setup(')
            let srcJSON: string = script!.substring(index1+21, script!.indexOf(');',index1))
            let index2: number = srcJSON.indexOf("file: '")
            return srcJSON.substring(index2 + 7, srcJSON.indexOf("',")).trim()
        }).catch(() => {
            console.log(chalk.redBright('unable to get video source'))
            process.exit(1)
        });
    }

}

