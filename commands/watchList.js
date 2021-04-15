const nconf  = require('nconf');
const chalk = require('chalk');
const util = require('../utils/utils')

let watchList = {
     async newShow(anime) {
         try{
             nconf.use('file', {file: util.getConfigPath()});
             nconf.load();
         }catch (e) {
             await util.recreateConfig()
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

        nconf.save(function (err) {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log(chalk.green('added successfully'));
        });
    },

    async removeShow(anime) {
        try{
            nconf.use('file', {file: util.getConfigPath()});
            nconf.load();
        }catch (e) {
            await util.recreateConfig()
        }
        let shows = nconf.get('shows');
        if(shows === undefined) {
            console.log(chalk.yellow('there are no shows on the watch list'));
            process.exit(0)
        }
        shows = shows.filter(item => item.href !== anime.href)
        nconf.set('shows', shows);

        nconf.save(function (err) {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log(chalk.green('removed successfully'));
        });
    }
}
module.exports = watchList