import {Anime} from "../models/Anime";
import nconf  = require('nconf');
const chalk = require('chalk');
const utils = require('../utils/utils').utils

export let watchList = {
     async newShow(anime: Anime) {
         try{
             nconf.use('file', {file: utils.getConfigPath()});
             nconf.load();
         }catch (e) {
             await utils.recreateConfig()
         }
        let shows = nconf.get('shows');
        if(shows === undefined)
            shows = [anime]
        else {
            for(let show of shows){
                if(show.href === anime.href){
                    console.log(chalk.yellow('watch list already contains ' + show.name));
                    return
                }
            }
            shows.unshift(anime)
        }
        nconf.set('shows', shows);

        nconf.save(function (err: Error) {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log(chalk.green('added successfully'));
        });
    },

    async removeShow(anime: Anime) {
        try{
            nconf.use('file', {file: utils.getConfigPath()});
            nconf.load();
        }catch (e) {
            await utils.recreateConfig()
        }
        let shows = nconf.get('shows');
        if(shows === undefined) {
            console.log(chalk.yellow('there are no shows on the watch list'));
            process.exit(0)
        }
        shows = shows.filter((item: Anime) => item.href !== anime.href)
        nconf.set('shows', shows);

        nconf.save(function (err: Error) {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log(chalk.green('removed successfully'));
        });
    }
}