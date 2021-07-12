import chalk from 'chalk';
import {Anime} from "../models/Anime";
import VideoPlayer from "../players/VideoPlayer";
import VLC from "../players/VLC";
import MPV from "../players/MPV";
import nconf = require('nconf');
import {utils} from "../utils/utils";
import {driver} from "../driver/driver";
import MyAnimeList from "../utils/mal_utils";
let mal = new MyAnimeList("00d2c5d06cc8ec154ddd8c8c22ace667")
export let watch = {
    getPlayer: function (player: string | undefined): string
    {
        if(player === undefined)
        {
            nconf.use('file', {file: utils.getConfigPath()})
            nconf.load()
            if (nconf.get('player') === undefined)
            {
                nconf.set('player', 'vlc')
                nconf.save(function (err: any) {})
                return 'vlc'
            }
            else if(nconf.get('player') === 'mpv'){
                return 'mpv'
            }else
            {
                return 'vlc'
            }
        }
        else if(player === 'mpv'){
            return 'mpv'
        }
        else {
            return 'vlc'
        }
    },
    watch: async function (anime: Anime, lower:number, upper:number, player:string | undefined, type:string)
    {
        let videoPlayer: VideoPlayer;
        for (let i: number = lower; i <= upper; i++) {
            console.log(chalk.gray('fetching episode ' + i + ' ...'))
            let stream = await driver.getOptimizedPlayer(anime, i, type)
            if (stream !== null && stream !== undefined && stream !== '') {
                if (i === lower) {
                    player = this.getPlayer(player)
                    if(player === 'vlc')
                        videoPlayer = new VLC(stream)
                    else if(player === 'mpv')
                        videoPlayer = new MPV(stream)
                    console.log(chalk.greenBright(`starting ${player} with episode ${i}`))
                    if(stream.endsWith('.m3u8'))
                        console.log(chalk.yellowBright(`Source is an .m3u8, starting ${player} player will take a minute. Please be patient.`))
                } else {
                    await videoPlayer!.append(stream)
                    console.log(chalk.greenBright(`added episode ${i} to queue`))
                }
                videoPlayer!.getEventListener(stream, i).on('watch_80', function (ani)
                {
                    mal.update_list(anime.id,{num_watched_episodes:ani.ep})
                })
            }
            else {
                console.log(chalk.redBright('unable to add episode ' + i + ' to queue'))
            }
        }
    }
}