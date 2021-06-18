import VLCommand from "vlc-command";
const chalk = require("chalk");
import cp = require('child_process')
import VideoPlayer from "./VideoPlayer";
const crypto = require("crypto");
const secret = crypto.randomBytes(20).toString("hex")
const { curly } = require('node-libcurl');

export default class VLC implements VideoPlayer{

     constructor(url: string) {
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

    async append(url: string): Promise<void> {
        await curly.get('http://:'+secret+'@localhost:6942/requests/status.json?command=in_enqueue&input='+url)
     }
}