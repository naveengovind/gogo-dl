import {Anime} from "../models/Anime";
const Aria2 = require("aria2");
const aria2 = new Aria2();
const { spawn } = require('child_process');
const path = require('path');
import chalk from 'chalk';
import site from "../sites/site";
import Gogoanime from '../sites/Gogoanime'
import FourAnime from '../sites/4anime'
import GogoanimePup from "../sites/Gogoanime-pup";
const cliProgress = require('cli-progress');
let commandExists = require('command-exists');

export let dl = {
    async download(anime: { name:string, href:string }, lower: number, upper: number)
    {
        function delay(ms: number) {
            return new Promise( resolve => setTimeout(resolve, ms) );
        }
        async function update_bar(results: any, i: number, bars: Array<any>) {
            if(bars[i] !== null)
            {
                if (parseInt(results[i][0].totalLength) != 0)
                {
                    let speed: string | number = chalk.yellowBright('waiting')
                    if(parseInt(results[i][0].downloadSpeed) !== 0)
                        speed = parseInt(((results[i][0].totalLength - results[i][0].completedLength) / parseInt(results[i][0].downloadSpeed)).toFixed(0)) +'s'
                    bars[i].update(parseFloat(((results[i][0].completedLength / results[i][0].totalLength) * 100).toFixed(2)), {et: speed})
                }
                if (results[i][0].status === 'complete')
                {
                    await bars[i].update(100, {et: chalk.greenBright('completed')})
                    bars[i] = null
                }
            }
        }

        const multibar = new cliProgress.MultiBar({
            clearOnComplete: false,
            hideCursor: false,
            format: 'ep: {ep}{gap}|' + chalk.cyanBright('[{bar}]') +' {percentage}% | ETA: {et} | {value}/{total}'
        });
        let aria_bin: string = ''

        try {
            if(process.platform.startsWith('win'))
            {
                await commandExists('aria2c.exe');
                aria_bin = 'aria2c.exe'
            }else{
                await commandExists('aria2c');
                aria_bin = 'aria2c'
            }
        }catch (e) {
            console.log(chalk.redBright('aria2 is required to download videos download at https://github.com/aria2/aria2/releases'))
            process.exit(34)
        }

        const cli = spawn(aria_bin, ['--enable-rpc', '--rpc-listen-all=true', '--rpc-allow-origin-all'/*,'--rpc-secret='+secret*/]);
        cli.stdout.on('data', function(data:any) {
            //console.log(data.toString());
        });
        process.on('SIGINT', async function() {
            await cli.kill('SIGINT')
            process.exit(0)
        });
        let t_site : site = new GogoanimePup()
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
            }, 0);
        });
        await delay(2000)
        for(let i: number = lower; i <= upper; i++) {
            let url = await t_site.getVideoSrc(anime.href, i)
            //let url = 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4'
            if (url != null) {
                let name = anime.name.trim().split(':').join(' ')/*.split('/').join('-').split(' ').join('-')*/
                let f_name = name + ' episode ' + i + url.substring(url.lastIndexOf('.'))
                if(url !== '' && !url.endsWith('.m3u8')){
                    let temp_id = await aria2.call('addUri', [url], {dir:path.join(process.cwd(),name), out: name + ' episode ' + i + '.mp4'})
                    multi.push(["tellStatus", temp_id])
                    let gap: string = ' '.repeat(3-(''+i).length)
                    bars.push(multibar.create(100, 0,{ep: i, gap: gap, et: chalk.yellowBright('waiting')}))
                }else{
                    //console.log(chalk.red('back up failed skipping episode ' + i))
                }
            }
        }
        await wait_for
        await delay(1000)
        await cli.kill('SIGINT')
        console.log(chalk.greenBright('\ndownloads complete!'))
        process.exit(0)
    }
}