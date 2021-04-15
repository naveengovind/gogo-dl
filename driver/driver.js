const prompts = require("prompts");
const chalk = require("chalk");
const gogo_scraper = require("../utils/gogo_scraper");
const downloader = require("../commands/dl");
const watch = require("../commands/watch");
const watchList = require("../commands/watchList")
const nconf  = require('nconf');
const util = require("../utils/utils");

let driver = {

   askForShow: async function (title, type){
       let options;
        if(type !== 'list' && type !== 'remove') {
            options = await gogo_scraper.search(title)

            if (options === null || options === undefined || options === []) {
                console.log(chalk.redBright('no results found for ') + chalk.yellow('keyword'))
                process.exit(0)
            }
        }else{
            try{
                nconf.use('file', {file: util.getConfigPath()});
                nconf.load();
            }catch (e) {
                await util.recreateConfig()
            }
            options = nconf.get('shows');
            if(type === 'list')
                type = title
        }
        let choices = {
            type: 'select',
            name: 'value',
            message: 'Pick a show',
            choices: [

            ],
            initial: 0,
        };

        for (let i = 0; i < options.length; i++)
            choices.choices.push({title: options[i].name, description: ''+options[i].released, value: i})

        console.log();

        const response = await prompts(choices);

        if(response.value === undefined)
            process.exit(0)

        else if(type === 'watchList') {
            await watchList.newShow(options[response.value])
        }
        else if(type === 'remove') {
            await watchList.removeShow(options[response.value])
        }
        else {
            await driver.execute(options[response.value], type)
        }

    },
     execute: async function(anime, type){

        let meta = await gogo_scraper.getEpMetaData(anime.href)

        console.log(`\nThere are ${chalk.magenta(meta.lastEpisode)} episodes`)

        let options = {
            type: 'text',
            name: 'value',
            message: `Episode range [1-${meta.lastEpisode}]`
        };

        let range = await prompts(options);
        range = range.value

        if(range === undefined)
            process.exit(0)

        range = this.getRangeFromString(range)

         if(type === 'dl') {
            console.log()
            await downloader.download(anime, range.lower, range.upper)
        }
        else if(type === 'watch')
            await watch.watch(anime, range.lower, range.upper)
    },

    getRangeFromString: function(range)
    {
        let ind = range.indexOf('-')
        let lower = 1
        let upper = 1

        if (ind === undefined || ind === -1) {
            lower = Number(range.trim())
            upper = Number(range.trim())
        }
        else{
            lower = Number(range.substring(0, ind).trim())
            upper = Number(range.substring(ind+1).trim())
        }
        return {lower: lower, upper: upper}
    },

}
module.exports = driver