const videoPlayer = require("../utils/videoPlayers");
const chalk = require("chalk");
const gogo_scraper = require("../utils/gogo_scraper");
let watch = {
    watch: async function (anime, lower, upper)
    {
        let urls = []
        for(let i = lower; i <= upper; i++)
        {
            console.log(chalk.gray('fetching episode ' + i+ ' ...'))
            let stream = await gogo_scraper.getVidStreamURL(anime.href, i)
            urls[i-lower] = await gogo_scraper.getVideoSrc(stream)
            console.log(chalk.green('fetched episode ' + i))
        }
        await videoPlayer.vlc(urls)
    }
}
module.exports = watch