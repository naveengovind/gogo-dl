import site from "../sites/site";

const chalk = require('chalk');
import {Anime} from "../models/Anime";
import VideoPlayer from "../players/VideoPlayer";
import VLCPlayer from "../players/VLCPlayer";
import MPVPlayer from "../players/MPVPlayer";
import Gogoanime from "../sites/Gogoanime";
export let watch = {
    watch: async function (anime: Anime, lower:number, upper:number, player:string)
    {
        let t_site: site = new Gogoanime()
        let videoPlayer: VideoPlayer;
       for(let i: number = lower; i <= upper; i++) {
           console.log(chalk.gray('fetching episode ' + i + ' ...'))
           let stream = await t_site.getVideoSrc(anime.href, i)
           if (stream != null) {
               if (i === lower) {
                   if(player === 'vlc')
                       videoPlayer = await new VLCPlayer(stream)
                    else
                       videoPlayer = await new MPVPlayer(stream)
                   console.log(chalk.green('starting mpv with episode ' + i))
               }else{
                   await videoPlayer!.append(stream)
                   console.log(chalk.green('added episode ' + i + ' to queue'))
               }
           }else
           {
               console.log(chalk.red('unable to add episode ' + i + ' to queue'))
           }
       }
    }
}