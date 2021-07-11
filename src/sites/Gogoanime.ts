import got from 'got';
import {JSDOM} from "jsdom";
import {MetaData} from "../models/MetaData";
import site from "./site";
import puppeteer from "puppeteer";

const BASE_URL = 'https://gogoanime.vc';

export default class Gogoanime extends site
{
    constructor()
    {
        super(BASE_URL);
    }

    async getMetaData(slug: string): Promise<MetaData>
    {
        const myURL = new URL(slug);
        let url = BASE_URL + slug.replace(myURL.origin, '')
        return await got(url).then(response =>
        {
            const dom = new JSDOM(response.body);
            let epList: HTMLCollection = dom.window.document.getElementById('episode_page')!.children
            let lastEp: string = epList.item(epList.length - 1)!.getElementsByTagName('a').item(0)!.getAttribute('ep_end')!
            return new MetaData(parseInt(lastEp))
        }).catch(() =>
        {
            return new MetaData()
        });
    }

     private static getElem(i:number, items: HTMLCollection, className:string): HTMLAnchorElement
     {
         return items.item(i)!.getElementsByClassName(className).item(0)!.getElementsByTagName('a').item(0)!
     }

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
    }
*/
    private async getVidStreamURL(slug: string, episode: number, server: string): Promise<string | null>
    {
        const myURL = new URL(slug);
        let url: string = BASE_URL + slug.replace('category', '').replace(myURL.origin, '') + "-episode-" + episode
        if (server === 'anime')
            return url
        else
        {
            return await got(url).then(response =>
            {
                const dom: JSDOM = new JSDOM(response.body);
                return "https://" + dom.window.document.getElementsByClassName(server).item(0)!
                    .getElementsByTagName('a').item(0)!.getAttribute('data-video')!.replace('https://', '')
            }).catch(() =>
            {
                return null
            });
        }
    }

    private async get_vidcdn(url: string): Promise<string | undefined>
    {
        return await got(url).then(response =>
        {
            const dom: JSDOM = new JSDOM(response.body);
            let script: string | null = dom.window.document.querySelector('body > div > div > script')!.textContent;
            let index1: number = script!.indexOf('playerInstance.setup(')
            let srcJSON: string = script!.substring(index1 + 21, script!.indexOf(');', index1))
            let index2: number = srcJSON.indexOf("file: '")
            return srcJSON.substring(index2 + 7, srcJSON.indexOf("',")).trim()
        }).catch(() =>
        {
            return undefined
        });
    }

    private async get_anime(url: string): Promise<string | undefined>
    {
        let temp: any = ''
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        return new Promise(async resolve =>
        {
            page.on('response', async (response) =>
            {
                if (response.url().indexOf('encrypt-ajax.php') > 0)
                {
                    temp = await response.json()
                    resolve(temp['source'][0]['file'])
                }
            });
            await page.goto(url);
            await browser.close();
        })
    }

    private async get_xstreamcdn(url: string): Promise<string | undefined>{
        try
        {
            const myURL = new URL(url);
            url = myURL.origin + myURL.pathname.replace('v/', 'api/source')
            let res = await got(url, {method: "POST"})
            let files = JSON.parse(res.body)['data']['file']
            return files[files.length - 1]
        }catch (e){
            return undefined
        }
    }
    private async get_streamtape(url: string): Promise<string | undefined>{
        try
        {
            let res = await got(url)
            let ind1 = res.body.indexOf("document.getElementById('vid'+'eolink').innerHTML = ")+52
            let ind2 = res.body.indexOf('</script>', ind1)
            return "https:"+eval(res.body.substring(ind1,ind2))
        }catch (e){
            return undefined
        }
    }

    async getVideoSrc(slug: string, episode: number, server: string='anime'): Promise<string | undefined>
    {
        try
        {
            let resp = await this.getVidStreamURL(slug, episode, server)
            if (resp !== null)
            {
                let url = resp!
                if (server === 'vidcdn')
                    return await this.get_vidcdn(url)
                else if (server === 'anime')
                    return await this.get_anime(url)
                else if (server === 'xstreamcdn')
                    return await this.get_xstreamcdn(url)
                else if (server === 'streamtape')
                    return await this.get_streamtape(url)
                else
                    return undefined
            }
        }catch (e)
        {
            return undefined
        }
    }
}