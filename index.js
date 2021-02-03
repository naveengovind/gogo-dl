#! /usr/bin/env node

const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const https = require('https');
const fs = require('fs');
const yargs = require('yargs');
const prompt = require('prompt-sync')({sigint: true});
const chalk = require('chalk');
const progress = require('request-progress');
cliProgress = require('cli-progress');
const cp = require('child_process')
const vlcCommand = require('vlc-command')

const BASE_URL = 'https://gogoanime.so';

yargs.scriptName("gogo-dl")
    .usage('$0 <cmd> [args]')
    .command('dl [title]', 'download anime into your current directory', (yargs) => {
        yargs.positional('title', {
            type: 'string',
            default: 'JoJo',
            describe: 'title of the anime'
        })
    }, async function (argv) {
        await prompter(argv.title, 'dl')
    })
    .command('watch [title]', 'stream the anime through a media player(VLC)', (yargs) => {
        yargs.positional('title', {
            type: 'string',
            default: 'JoJo',
            describe: 'title of the anime'
        })
    }, async function (argv) {
        await prompter(argv.title, 'watch')
    })
    .help()
    .argv

async function prompter(title, type){

    let options = await search(title)
    console.log()

    for (let i = 0; i < options.length; i++)
        console.log(`[${chalk.yellow(i)}]: ${options[i].name}`)

    console.log()
    const raw = await prompt('Which one [0]: ');
    let choice = Number(raw)

    let meta = await getEpMetaData(options[choice].href)

    console.log(`\nThere are ${chalk.magenta(meta.lastEpisode)} episodes`)

    let range = await prompt(`Episode range [1-${meta.lastEpisode}]: `);
    let ind = range.toString().indexOf('-')
    let lower = 1
    let upper = 1

    if (ind === -1 || ind === undefined)
    {
        lower = Number(range.toString().trim())
        upper = Number(range.toString().trim())
    }
    else{
        lower = Number(range.toString().substring(0, ind).trim())
        upper = Number(range.toString().substring(ind+1).trim())
    }
    console.log()
    if(type === 'dl')
        await dl(options[choice], lower, upper)
    else if(type === 'watch')
        await watch(options[choice], lower, upper)
}

async function dl(anime, lower, upper)
{
    if(lower <= upper) {
        await downloadVideo(anime, lower, upper)
    }
}

async function watch(anime, lower, upper)
{
    let urls = " "
    for(let i = lower; i <= upper; i++)
    {
        let stream = await getVidStreamURL(anime.href, i)
        let url = await getVideoSrc(stream)
        urls += url + ' '
    }

    vlcCommand(function (err, cmd) {
        if (err) {
            console.log(chalk.redBright('could not find VLC command path make sure you have VLC installed with command line tools'))
            process.exit(1)
        }
        if (process.platform === 'win32') {
            cp.execFile(cmd, [urls], function (err, stdout) {
                if (err) return console.error(err)
                console.log(stdout)
            })
        } else {
            cp.exec(cmd + urls, function (err, stdout) {
                if (err) return console.error(err)
                console.log(stdout)
            })
        }
    })

}

async function getEpMetaData(href)
{
    let url = BASE_URL + href
    return await got(url).then(response => {
        const dom = new JSDOM(response.body);
        let eplist = dom.window.document.getElementById('episode_page').children
        let lastEp = eplist.item(eplist.length-1).getElementsByTagName('a').item(0).getAttribute('ep_end')
        let ret = new MetaData(Number(lastEp))
        return ret
    }).catch(err => {
        console.log(chalk.redBright('unable to get meta data'))
        process.exit(1)
    });
}
async function search(keyword)
{

    let searchURL = BASE_URL + "//search.html?keyword=" + keyword

    return await got(searchURL).then(response => {
        let results = []
        const dom = new JSDOM(response.body)
        let itemList = dom.window.document.getElementsByClassName('items')

        let items = itemList.item(0).children

        for(let i = 0; i < items.length; i++)
        {
            let href = (items.item(i).getElementsByClassName('name').item(0).getElementsByTagName('a').item(0).href)
            let name = (items.item(i).getElementsByClassName('name').item(0).getElementsByTagName('a').item(0).title)
            let img = (items.item(i).getElementsByClassName('img').item(0).getElementsByTagName('a').item(0).getElementsByTagName('img').item(0).src)
            let released = (items.item(i).getElementsByClassName('released').item(0).textContent)
            released = released.substring(released.indexOf(': ') + 2).trim()
            results[i] = (new Anime(name, href, img, Number(released)))
        }
        return results
    }).catch(err => {
        console.log(chalk.redBright('no results found for ') + chalk.yellow(keyword))
        process.exit(1)
    });
}

async function getVidStreamURL(href, episode)
{
    let url = BASE_URL + '/' + href.substring(href.lastIndexOf('/')+1)+ "-episode-" + episode
    return await got(url).then(response => {
        const dom = new JSDOM(response.body);
        let streamlink = dom.window.document.getElementsByClassName('vidcdn').item(0)
            .getElementsByTagName('a').item(0).getAttribute('data-video');
        return streamlink
    }).catch(err => {
        console.log(chalk.redBright('unable to find video URL'))
        process.exit(1)
    });

}

async function getVideoSrc(url) {
    url = 'https://' + url
    return await got(url).then(response => {
        const dom = new JSDOM(response.body);
        let script = dom.window.document.querySelector('body > div > div > script').textContent;
        let index1 = script.indexOf('playerInstance.setup(')
        let srcJSON = script.substring(index1+21, script.indexOf(');',index1))
        let index2 = srcJSON.indexOf("file: '")
        let srcURL = srcJSON.substring(index2+7, srcJSON.indexOf("',")).trim()
        return srcURL
    }).catch(err => {
        console.log(chalk.redBright('unable to get video source'))
        process.exit(1)
    });
}


async function downloadVideo(anime, lower, upper) {

    let stream = await getVidStreamURL(anime.href, lower)
    let url = await getVideoSrc(stream)
    name = anime.name.trim().replaceAll('/', '-').replaceAll(' ', '-') + '-episode-' + lower
    let dest = process.cwd()+"/"+ name + '.mp4'


    let file = fs.createWriteStream(dest);

    const progressBar = new cliProgress.SingleBar({
        format: `ep: ${lower} |` + chalk.cyan('{bar}') + '| {percentage}% | ETA: {eta}s',
        clearOnComplete: true,
    }, cliProgress.Presets.shades_classic);

    let totalBytes = 0

    let request = https.get(url, function(response) {
        totalBytes = response.headers['content-length'];
        progressBar.start(totalBytes, 0);

        response.pipe(file);
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


let Anime = class Anime{
    constructor(name, href, img, released)
    {
        this.name = name
        this.href = href
        this.img = img
        this.released = released
    }
}
//TODO
let MetaData = class MetaData{
    constructor(lastEpisode, type, plotSummary, genre, released, status)
    {
        this.lastEpisode = lastEpisode
        this.satus = status;
        this.plotSummary = plotSummary
        this.genre = genre
        this.released = released
    }
}

