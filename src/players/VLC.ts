import VLCommand from "vlc-command";
const chalk = require("chalk");
import cp = require('child_process')
import VideoPlayer from "./VideoPlayer";
import EventEmitter from "events";
const crypto = require("crypto");
const secret = crypto.randomBytes(20).toString("hex")
const { curly } = require('node-libcurl');
var emitter = require('events').EventEmitter;

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
            if (process.platform === 'win32') {
                cp_pros = await cp.spawn(cmd, [" --extraintf http --http-password "+ secret +" --http-port 6942 " + url])
            } else {
                cp_pros = await cp.spawn(cmd, ["--extraintf","http", "--http-password", secret, "--http-port", '6942', url])
            }
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
    async append(url: string) {
         await this.check()
        return JSON.parse((await curly.get('http://:'+secret+'@localhost:6942/requests/status.json?command=in_enqueue&input='+url)).data)
     }

     async getPercentPos(){
         await this.check()
         let a = JSON.parse((await curly.get('http://:'+secret+'@localhost:6942/requests/status.json')).data)
         return (a.time/a.length)*100
     }
     private async get_status(){
         await this.check()
         return JSON.parse((await curly.get('http://:'+secret+'@localhost:6942/requests/status.json')).data)
     }
    private async get_playlist(){
         await this.check()
        return JSON.parse((await curly.get('http://:'+secret+'@localhost:6942/requests/playlist.json')).data)
    }

     async getFileName():Promise<string>{
         await this.check()
         let childs = (await this.get_playlist())['children'][0]["children"]
         let stusts = (await this.get_status())
         const match = stusts['information']['category']['meta']['filename']
         for(const child of childs){
             if(match == child['name']){
                 return child['uri'].toString()
             }
         }
         return ''
    }

}