import {Anime} from '../models/Anime'
import chalk from 'chalk';
import got from 'got';
import {JSDOM} from "jsdom";
import {MetaData} from "../models/MetaData";
import site from "./site";
import {utils} from "../utils/utils";
import puppeteer from "puppeteer";
import UserAgent from 'user-agents';
const BASE_URL = 'https://9anime.pw';

export default class NineAnime implements site{

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
                        lastEp = parseInt(last.item(last.length - 1)!.textContent!)
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

    async getVideoSrc(href: string, episode: number): Promise<string> {
        let temp: any = ''
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
                        temp = await response.json()
                        resolve(temp['media']['sources'][0]['file'])
                        await browser.close();
                    }
                });
                await page.goto(url);
                await page.waitForNavigation();
                await browser.close();
            }catch (e)
            {
                resolve(temp['media']['sources'][0]['file'])
            }
        })
    }

    async slugExists(href:string){
        return utils.ping(BASE_URL + '/anime/'+href)
    }
}