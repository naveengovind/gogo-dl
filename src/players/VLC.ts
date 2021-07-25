import VLCommand from "vlc-command";
const chalk = require("chalk");
import cp = require('child_process')
import VideoPlayer from "./VideoPlayer";
const crypto = require("crypto");
import puppeteer from "puppeteer";
const secret = crypto.randomBytes(20).toString("hex")
export default class VLC extends VideoPlayer{
    private s_time: number;

     constructor(url: string) {
         super()
         this.s_time = Date.now()
        let cp_pros: any
        VLCommand(async function (err: Error, cmd:string) {
            if (err) {
                console.log(chalk.redBright('could not find VLC command path make sure you have VLC installed\ncheckout: https://www.videolan.org/vlc/'))
                process.exit(0)
            }
            cp_pros = await cp.spawn(cmd, ["--extraintf","http", "--http-password", secret, "--http-port", '6942', url])
            cp_pros!.on('exit', function() {
                process.exit(0)
            })
        })
    }
    private async check(){
        function delay(ms: number) {
            return new Promise( resolve => setTimeout(resolve, ms) );
        }
        let end = Date.now()
        if(end - this.s_time < 10000){
            await delay(10000 - (end - this.s_time))
        }
    }
    async append(url: string):Promise<any> {
        await this.check()
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        let ret = await (await page.goto(`http://:${secret}@localhost:6942/requests/status.json?command=in_enqueue&input=${url}`)).json()
        browser.close()
        return ret
     }

     async getPercentPos(){
         try
         {
             await this.check()
             let a = await this.get_status()
             return (a.time / a.length) * 100
         }catch (e)
         {
             return 0.0
         }
     }
     private async get_status():Promise<any>{
         await this.check()
         const browser = await puppeteer.launch();
         const page = await browser.newPage();
         let ret  = await (await page.goto(`http://:${secret}@localhost:6942/requests/status.json`)).json()
         browser.close()
         return ret
     }

    private async get_playlist():Promise<any>{
         await this.check()
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        let ret = await (await page.goto(`http://:${secret}@localhost:6942/requests/playlist.json`)).json()
        browser.close()
        return ret
    }

     async getFileName():Promise<string>{
         try
         {
             await this.check()
             let childs = (await this.get_playlist())['children'][0]["children"]
             let stusts = (await this.get_status())
             const match = stusts['information']['category']['meta']['filename']
             for (const child of childs)
             {
                 if (match === child['name'])
                 {
                     return child['uri'].toString()
                 }
             }
         }catch (e) {}
         return ''
    }

}