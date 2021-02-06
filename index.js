#! /usr/bin/env node

const https = require('https');
const fs = require('fs');
const yargs = require('yargs');
const prompts = require('prompts');
const chalk = require('chalk');
const progress = require('request-progress');
const cliProgress = require('cli-progress');
const cp = require('child_process')
const vlcCommand = require('vlc-command')

const MetaData = require('./models/MetaData')
const Anime = require('./models/Anime')
const gogo_scraper = require('./utils/gogo_scraper');


yargs.scriptName("gogo-dl")
    .usage('$0 <cmd> [args]')
    .command('dl [title]', 'download anime into your current directory', (yargs) => {
        yargs.positional('title', {
            type: 'string',
            default: 'JoJo',
            describe: 'title of the anime'
        })
    }, async function (argv) {
        await askForShow(argv.title, 'dl')
    })
    .command('watch [title]', 'stream the anime through a media player(VLC)', (yargs) => {
        yargs.positional('title', {
            type: 'string',
            default: 'JoJo',
            describe: 'title of the anime'
        })
    }, async function (argv) {
        await askForShow(argv.title, 'watch')
    })
    .help()
    .argv

async function askForShow(title, type){

    let options = await gogo_scraper.search( title)

    if(options === null || options === undefined ||options === [])
    {
        console.log(chalk.redBright('no results found for ') + chalk.yellow('keyword'))
        process.exit(0)
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

    await execute(options[response.value], type)

}
async function execute(anime, type){

    let meta = await gogo_scraper.getEpMetaData( anime.href)


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

    range = getRangeFromString(range)
    if(type === 'dl') {
        console.log()
        await dl(anime, range.lower, range.upper)
    }

    else if(type === 'watch')
        await watch(anime, range.lower, range.upper)
}

function getRangeFromString(range)
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
}

async function dl(anime, lower, upper)
{
    if(lower <= upper) {
        await downloadVideo(anime, lower, upper)
    }
}

async function watch(anime, lower, upper)
{
    console.log()
    let urls = []
    for(let i = lower; i <= upper; i++)
    {
        let stream = await gogo_scraper.getVidStreamURL(anime.href, i)
        urls[i-lower] = await gogo_scraper.getVideoSrc(stream)
        console.log(chalk.green('fetched episode ' + i))
    }

   await iina(urls)

}

async function iina(urls)
{
    let str = ''
    urls.forEach(url => (str = str + url + ' '))
    str = str.trim()
    cp.exec('/Applications/IINA.app/Contents/MacOS/iina-cli --dequeue ' + str)
}

async function vlc(urls)
{
    let str = ''
    urls.forEach(url => (str += url + ' '))
    str = ' ' + str.trim()
    vlcCommand(function (err, cmd) {
        if (err) {
            console.log(chalk.redBright('could not find VLC command path make sure you have VLC installed with command line tools'))
            process.exit(1)
        }
        if (process.platform === 'win32') {
            cp.execFile(cmd, [str], function (err, stdout) {
                if (err) return console.error(err)
                console.log(stdout)
            })
        } else {
            cp.exec(cmd + str, function (err, stdout) {
                if (err) return console.error(err)
                console.log(stdout)
            })
        }
    })
}

async function downloadVideo(anime, lower, upper) {

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
            dl(anime, lower+1, upper)
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




