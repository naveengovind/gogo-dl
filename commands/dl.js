const chalk = require("chalk");
const gogo_scraper = require("../utils/gogo_scraper");
const https = require("https");
const fs = require("fs");
const progress = require('request-progress');
const cliProgress = require('cli-progress');

let dl = {

    async download(anime, lower, upper)
    {
        async function downloadVideo(anime, lower, upper, cb) {
            let stream = await gogo_scraper.getVidStreamURL(anime.href, lower)
            let url = await gogo_scraper.getVideoSrc(stream)
            name = anime.name.trim().replaceAll('/', '-').replaceAll(' ', '-') + '-episode-' + lower
            let dest = process.cwd()+"/"+ name + '.mp4'

            let file = fs.createWriteStream(dest);

            const progressBar = new cliProgress.SingleBar({
                format: `ep: ${lower} |` + chalk.cyan('{bar}') + '| {percentage}% | ETA: {eta}s',
                clearOnComplete: true,
            }, cliProgress.Presets.shades_classic);

            let totalBytes = 0

            let request = await https.get(url, async function(response) {
                totalBytes = response.headers['content-length'];
                progressBar.start(totalBytes, 0);

                await response.pipe(file);
                file.on('finish',  async function() {
                    file.close();  // close() is async, call cb after close completes.
                    await progressBar.update(totalBytes)
                    progressBar.stop();
                    console.log(chalk.green('finished downloading episode ' + lower))
                    await cb(anime, lower + 1, upper)
                });
            }).on('error', async function(err) { // Handle errors
                await fs.unlink(dest, function () {}); // Delete the file async. (But we don't check the result)
            });

            progress((request), {})
                .on('progress', function (state) {
                    // console.log('progress', state);
                    progressBar.update(state.size.transferred, {
                        eta: state.time.remaining
                    });
                })

        }

        let cb = async function next(anime, lower, upper) {
            if(lower <= upper) {
                await downloadVideo(anime, lower, upper, cb)
            }
        }

        await cb(anime, lower, upper)
    }
}
module.exports = dl
