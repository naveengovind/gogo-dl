#!/usr/bin/env node

const {Builder, By, Key, until} = require('selenium-webdriver');
require('chromedriver');
const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const ProgressBar = require('progress')
const cliProgress = require('cli-progress');
const chrome = require('selenium-webdriver/chrome');
const yargs = require('yargs');
const prompt = require('prompt-sync')({sigint: true});
const chromiumBinary = require('chromium-binary');
const colors = require('colors');
require('youtube-dl')


    yargs.scriptName("gogo-dl")
    .usage('$0 <cmd> [args]')
    .command('dl [title]', 'welcome to anime downlaoder', (yargs) => {
        yargs.positional('title', {
            type: 'string',
            default: 'bleach',
            describe: 'title of the anime'
        })
    }, async function (argv) {
      await search(argv.title, true)
    })
    .command('list [title]', 'welcome to anime downlaoder', (yargs) => {
        yargs.positional('title', {
            type: 'string',
            default: 'bleach',
            describe: 'title of the anime'
        })
    }, async function (argv) {
        await search(argv.title, false)
    })
    .help()
    .argv

let downloading = true

async function search(name, down) {
    let options = new chrome.Options();
    options.setChromeBinaryPath(chromiumBinary.path);
    options.addArguments("--headless")
    options.addArguments("--mute-audio");

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    try {
        process.stdout.write('fetching data...')
        await driver.get("https://gogoanime.so//search.html?keyword=" + name);
        let elems = await driver.findElements(By.xpath("//*[@id=\"wrapper_bg\"]/section/section[1]/div/div[2]/ul/li"));
        for (let i = 0; i < elems.length; i++) {
            let temp = await elems[i].findElement(By.tagName("p")).findElement(By.tagName("a"));
            if(i === 0) {
                process.stdout.write("\r\x1b[K")
                console.log()
            }
            console.log("["+i + "]: "+ await temp.getAttribute("title"));
            elems[i]  = temp;
        }
        console.log()
        const raw = await prompt('Which one [0]: ');
        let choice = Number(raw)
        await driver.get(await elems[choice].getAttribute("href"));
        let episodes = await driver.findElement(By.id("episode_page")).getText();
        console.log("\nThere are " + episodes.substring(episodes.lastIndexOf('-')+1) + " episodes");


        let range = await prompt('Episode range [1:10]: ');
        let ind = range.toString().indexOf(':')
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
        let base = await driver.getCurrentUrl();
        let urls = await getUrls(driver, base, lower, upper);
        let baseTitle = base.substring(base.lastIndexOf('/') + 1) + "-episode-"
        if (down)
        {
            for (let i = lower; i <= upper; i++) {
                //console.log("downloading episode " + i);
                downloading = true
                await download(urls[i - lower], baseTitle + i + ".mp4", i);
               // while(downloading){}
            }
        }
        else{
            urls.forEach(url => console.log(url))
        }

    } finally {
        await driver.quit();
    }
}

async function getUrls( driver, base, lower, upper)
{
    process.stdout.write('fetching episodes...')
    let urls = [];
    for (let i = lower; i <= upper; i++) {
        await driver.get("https://gogoanime.so/" + base.substring(base.lastIndexOf('/') + 1) + "-episode-" + i);
        await driver.get(await driver.findElement(By.xpath("//*[@id=\"load_anime\"]/div/div/iframe")).getAttribute("src"));
        //start video player to expose source url
        await driver.findElement(By.xpath("/html/body")).sendKeys(Key.TAB, Key.TAB, Key.SPACE);
        let url = await driver.findElement(By.xpath("//*[@id=\"myVideo\"]/div[2]/div[4]/video")).getAttribute("src");
        await urls.push(url);
        if(i === lower) {
            process.stdout.write("\r\x1b[K")
            console.log()
        }
        console.log(('fetched episode ' + i).green)
    }
     return urls;
}

async function download( url, name, episode) {
    const YoutubeDlWrap = require("youtube-dl-wrap");
    const youtubeDlWrap = new YoutubeDlWrap();
    //Execute and return an EventEmitter

    let youtubeDlEmitter = await youtubeDlWrap.exec([url,
        "-f", "best", "-o", process.cwd() +"/"+ name])
        .on("progress", (progress) =>
        {
            let downloaded = ((Number(progress.percent)/100) * Number(progress.totalSize.replace(/\D/g, "")))
            //process.stdout.write("\r\x1b[K")
            console.log( `[ep:${episode}, ${(downloaded/100).toFixed(2)}/${progress.totalSize}(${progress.percent}%), DL:${progress.currentSpeed}, ETA:${progress.eta}]\n`)
        })
        //Exposes all youtube-dl events, for example:
        //[download] Destination: output.mp4 -> eventType = download and eventData = Destination: output.mp4
        //.on("youtubeDlEvent", (eventType, eventData) => console.log(eventType, eventData))
        .on("error", (error) => console.error(error))
        .on("close", () => {
            downloading = false
        });
}


async function downloadVid (url, name, episode) {
    const { data, headers } = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })
    const totalLength = headers['content-length']


    const writer = Fs.createWriteStream(
        process.cwd() +"/"+ name
    )

    data.on('data', (chunk) => b2.update(b2.value++))
    data.pipe(writer)
}
