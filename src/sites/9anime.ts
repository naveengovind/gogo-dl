import {JSDOM} from "jsdom";
import {MetaData} from "../models/MetaData";
import site from "./site";
import puppeteer from "puppeteer";
import UserAgent from 'user-agents';
const BASE_URL = 'https://9anime.pw';

export default class NineAnime extends site{
    constructor()
    {
        super(BASE_URL);
    }

    async getMetaData(href: string): Promise<MetaData>
    {
        let temp: any = ''
        const myURL = new URL(href);
        let url:string = BASE_URL + href.replace(myURL.origin, '')
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const userAgent = new UserAgent();
        await page.setUserAgent(userAgent.toString())
        let lastEp = 0
        return new Promise(async resolve =>
        {
            try
            {
                page.on('response', async (response) =>
                {
                    if (response.url().indexOf('ajax/anime/servers') > 0)
                    {
                        temp = await response.json()
                        let dom = new JSDOM(temp['html'])
                        let last = dom.window.document.getElementsByTagName('a')
                        lastEp = parseInt(last.item(last.length - 1)!.textContent!.replace('-Uncen',''))
                        resolve(new MetaData(lastEp))
                        await browser.close();

                    }
                });
                await page.goto(url);
                await page.waitForNavigation();
                await browser.close();
            }catch (e)
            {
                resolve(new MetaData(lastEp))
            }
        })
    }

    async getVideoSrc(href: string, episode: number, server:string=''): Promise<string|undefined> {
        if(href === undefined){
            return undefined
        }
        let temp: any = undefined
        const myURL = new URL(href);
        let url:string = BASE_URL + href.replace(myURL.origin, '') + '/ep-'+episode
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const userAgent = new UserAgent();
        await page.setUserAgent(userAgent.toString())
        return new Promise(async resolve =>
        {
            try
            {
                page.on('response', async (response) =>
                {
                    if (response.url().indexOf('vidstream.pro/info/') > 0)
                    {
                        temp = (await response.json())['media']['sources'][0]['file']
                        resolve(temp)
                        await browser.close();
                    }
                });
                await page.goto(url);
                await page.waitForNavigation();
                await browser.close();
            }catch (e)
            {
                resolve(temp)
            }
        })
    }
}