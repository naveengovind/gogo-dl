import VLCommand from "vlc-command";
import chalk from "chalk";
import cp = require('child_process')
import VideoPlayer from "./VideoPlayer";
const { curly } = require('node-libcurl');

export default class VLCPlayer implements VideoPlayer{

     constructor(url: string) {
        VLCommand(async function (err: Error, cmd:string) {
            if (err) {
                console.log(chalk.redBright('could not find VLC command path make sure you have VLC installed\ncheckout: https://www.videolan.org/vlc/'))
                process.exit(0)
            }
            if (process.platform === 'win32') {
                cp.spawn(cmd, [" --extraintf http --http-password hi --http-port 6942 " + url])
            } else {
                cp.spawn(cmd, ["--extraintf","http", "--http-password", "hi", "--http-port", '6942', url])
            }
        })
    }

    async append(url: string): Promise<void> {
        await curly.get('http://:hi@localhost:6942/requests/status.json?command=in_enqueue&input='+url)
     }
}