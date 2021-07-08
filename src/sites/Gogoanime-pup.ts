import Gogoanime from "./Gogoanime";
const BASE_URL = 'https://gogoanime.vc';
import puppeteer from "puppeteer";
export default class GogoanimePup extends Gogoanime{

    async getVideoSrc(href: string, episode: number): Promise<string> {
        let temp: any = ''
        const myURL = new URL(href);
        let url:string = BASE_URL + href.replace('category', '').replace(myURL.origin, '') + "-episode-" + episode
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
}