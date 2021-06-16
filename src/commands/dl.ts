import {Anime} from "../models/Anime";
const Aria2 = require("aria2");
const aria2 = new Aria2();
const { spawn } = require('child_process');
const path = require('path')
import * as chalk_t from 'chalk'
import site from "../sites/site";
import Gogoanime from "../sites/Gogoanime";
const chalk = chalk_t.default
const cliProgress = require('cli-progress');

export let dl = {
    async download(anime: Anime, lower: number, upper: number)
    {
        function delay(ms: number) {
            return new Promise( resolve => setTimeout(resolve, ms) );
        }
        async function update_bar(results: any, i: number, bars: Array<any>) {
            if(bars[i] !== null)
            {
                if (parseInt(results[i][0].totalLength) != 0)
                {
                    bars[i].update(parseFloat(((results[i][0].completedLength / results[i][0].totalLength) * 100).toFixed(2)), {ep: i + lower})
                }
                if (results[i][0].status === 'complete')
                {
                    await bars[i].update(100)
                    bars[i] = null
                }
            }
        }

        const multibar = new cliProgress.MultiBar({
            clearOnComplete: false,
            //stopOnComplete: true,
            hideCursor: true,
            format: 'ep: {ep}{gap}|' + chalk.cyanBright('[{bar}]') +' {percentage}% | ETA: {eta}s | {value}/{total}'
        });
        const cli = spawn('aria2c', ['--enable-rpc', '--rpc-listen-all=true', '--rpc-allow-origin-all', '--max-concurrent-downloads='+(1+(upper-lower))]);

        let t_site: site = new Gogoanime()
        let multi: Array<Array<any>> = []
        let bars: Array<any> = []

         let wait_for = new Promise(resolve => {
            setTimeout( async function(){
                let downloading = true
                while(downloading) {
                    await delay(100);
                    const results = await aria2.multicall(multi);
                    for(let i = 0; i < results.length; i++){
                        await update_bar(results, i, bars)
                        if (bars.length >= (1+upper-lower) && bars.every(element => element === null)){
                            downloading = false
                            break
                        }
                    }
                }
                resolve(downloading)
            }, 0 );
        });
        await delay(2000)
        for(let i: number = lower; i <= upper; i++) {
            let url = await t_site.getVideoSrc(anime.href, i)
            //let url = 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4'
            if (url != null) {
                let name = anime.name.trim().split('/').join('-').split(' ').join('-')
                let f_name = name + '-episode-' + i + '.mp4'
                let temp_id = await aria2.call('addUri', [url], {dir:path.join(process.cwd(),name), out: f_name})
                multi.push(["tellStatus", temp_id])
                let gap: string = ' '.repeat(3-(''+i).length)
                bars.push(multibar.create(100, 0,{ep: i, gap: gap}))
            }
        }
        await wait_for
        await delay(1000)
        cli.kill(0)
        process.exit(0)
    }
}