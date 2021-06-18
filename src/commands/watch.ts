import site from "../sites/site";
const chalk = require('chalk');
import {Anime} from "../models/Anime";
import VideoPlayer from "../players/VideoPlayer";
import VLC from "../players/VLC";
import MPV from "../players/MPV";
import Gogoanime from "../sites/Gogoanime";
import FourAnime from "../sites/4anime";
import nconf = require('nconf');
import {utils} from "../utils/utils";

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
    watch: async function (anime: Anime, lower:number, upper:number, player:string | undefined)
    {
        let t_site: site = new Gogoanime()
        let videoPlayer: VideoPlayer;
        for (let i: number = lower; i <= upper; i++) {
            console.log(chalk.gray('fetching episode ' + i + ' ...'))
            let stream = await t_site.getVideoSrc(anime.href, i)
            if (stream != null) {
                if (i === lower) {
                    player = this.getPlayer(player)
                    if(player === 'vlc')
                        videoPlayer = new VLC(stream)
                    else if(player === 'mpv')
                        videoPlayer = new MPV(stream)
                    console.log(chalk.greenBright('starting '+player+' with episode '+ i))
                } else {
                    await videoPlayer!.append(stream)
                    console.log(chalk.greenBright('added episode ' + i + ' to queue'))
                }
            }
            else {
                console.log(chalk.redBright('unable to add episode ' + i + ' to queue'))
            }
        }
    }
}