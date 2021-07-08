import {Anime} from '../models/Anime'
const chalk = require('chalk');
import got from 'got';
import {JSDOM} from "jsdom";
import {MetaData} from "../models/MetaData";
import site from "./site";
import {utils} from "../utils/utils";

const BASE_URL = 'https://gogoanime.vc';

export default class Gogoanime implements site{

    async getMetaData(slug: string): Promise<MetaData>
    {
        const myURL = new URL(slug);
        let url = BASE_URL + slug.replace(myURL.origin, '')
        return await got(url).then(response => {
            const dom = new JSDOM(response.body);
            let epList: HTMLCollection = dom.window.document.getElementById('episode_page')!.children
            let lastEp: string = epList.item(epList.length - 1)!.getElementsByTagName('a').item(0)!.getAttribute('ep_end')!
            return new MetaData(parseInt(lastEp))
        }).catch(() => {
            return new MetaData()
        });
    }

   /* private static getElem(i:number, items: HTMLCollection, className:string): HTMLAnchorElement
    {
        return items.item(i)!.getElementsByClassName(className).item(0)!.getElementsByTagName('a').item(0)!
    }
*/
    /*async search(keyword: string): Promise<Array<Anime>>
    {

        let searchURL: string = BASE_URL + "//search.html?keyword=" + keyword

        return await got(searchURL).then(response => {
            let results: Array<Anime> = []
            const dom = new JSDOM(response.body)
            let itemList = dom.window.document.getElementsByClassName('items')

            let items = itemList.item(0)!.children

            for(let i:number = 0; i < items.length; i++)
            {
                let slug = Gogoanime.getElem(i, items, 'name').href
                let name = Gogoanime.getElem(i, items, 'name').title
                let img = Gogoanime.getElem(i, items, 'img').getElementsByTagName('img').item(0)!.src
                let released = (items.item(i)!.getElementsByClassName('released').item(0)!.textContent)
                released = released!.substring(released!.indexOf(': ') + 2).trim()
                results[i] = (new Anime(name, slug, img, parseInt(released)))
            }
            return results
        }).catch(() => {
            return []
        });
    }*/

    private async getVidStreamURL(slug: string, episode: number): Promise<string | null>
    {
        const myURL = new URL(slug);
        let url:string = BASE_URL + slug.replace('category', '').replace(myURL.origin, '') + "-episode-" + episode
        return await got(url).then(response => {
            const dom: JSDOM = new JSDOM(response.body);
            return dom.window.document.getElementsByClassName('vidcdn').item(0)!
                .getElementsByTagName('a').item(0)!.getAttribute('data-video')
        }).catch(() => {
            return null
        });

    }

     async getVideoSrc(slug: string, episode: number): Promise<string> {
        let url = 'https://' + await this.getVidStreamURL(slug, episode)
        return await got(url).then(response => {
            const dom:JSDOM = new JSDOM(response.body);
            let script : string | null = dom.window.document.querySelector('body > div > div > script')!.textContent;
            let index1:number = script!.indexOf('playerInstance.setup(')
            let srcJSON: string = script!.substring(index1+21, script!.indexOf(');',index1))
            let index2: number = srcJSON.indexOf("file: '")
            return srcJSON.substring(index2 + 7, srcJSON.indexOf("',")).trim()
        }).catch(() => {
            return ''
        });
    }

    slugExists(slug: string): Promise<boolean>
    {
        return utils.ping(BASE_URL + '/category/'+slug)
    }

}

