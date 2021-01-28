#!/usr/bin/env node

const {Builder, By, Key, until} = require('selenium-webdriver');
require('chromedriver');
const chrome = require('selenium-webdriver/chrome');
const yargs = require('yargs');
const prompt = require('prompt-sync')({sigint: true});

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

async function search(name, down) {
    let options = new chrome.Options();
    options.addArguments("--headless")
    options.addArguments("--mute-audio");
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    try {
        await driver.get("https://gogoanime.so//search.html?keyword=" + name);
        let elems = await driver.findElements(By.xpath("//*[@id=\"wrapper_bg\"]/section/section[1]/div/div[2]/ul/li"));
        for (let i = 0; i < elems.length; i++) {
            let temp = await elems[i].findElement(By.tagName("p")).findElement(By.tagName("a"));
            console.log("["+i + "]: "+ await temp.getAttribute("title"));
            elems[i]  = temp;
        }
        const raw = await prompt('Which one [0]: ');
        let choice = Number(raw)
        await driver.get(await elems[choice].getAttribute("href"));
        let episodes = await driver.findElement(By.id("episode_page")).getText();
        console.log("\nThere are " + episodes.substring(episodes.lastIndexOf('-')+1) + " episodes\n");
        const les = await prompt('Starting episode [1]: ');
        let lower = Number(les)
        const up = await prompt('Ending episode [1]: ');
        let upper = Number(up)
        let base = await driver.getCurrentUrl();
        let urls = await getUrls(driver, base, lower, upper);
        let baseTitle = base.substring(base.lastIndexOf('/') + 1) + "-episode-"
        if (down)
        {
            for (let i = lower; i <= upper; i++) {
                console.log("\ndownloading episode " + i);
                await download(urls[i - lower], baseTitle + i + ".mp4");
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
    let urls = [];
    for (let i = lower; i <= upper; i++) {
        await driver.get("https://gogoanime.so/" + base.substring(base.lastIndexOf('/') + 1) + "-episode-" + i);
        await driver.get(await driver.findElement(By.xpath("//*[@id=\"load_anime\"]/div/div/iframe")).getAttribute("src"));
        //start video player to expose source url
        await driver.findElement(By.xpath("/html/body")).sendKeys(Key.TAB, Key.TAB, Key.SPACE);
        let url = await driver.findElement(By.xpath("//*[@id=\"myVideo\"]/div[2]/div[4]/video")).getAttribute("src");
        await urls.push(url);
    }
     return urls;
}
async function download( url, name) {
    const YoutubeDlWrap = require("youtube-dl-wrap");
    const youtubeDlWrap = new YoutubeDlWrap();

//Execute and return an EventEmitter
    let youtubeDlEmitter = youtubeDlWrap.exec([url,
        "-f", "best", "-o", process.cwd() +"/"+ name])
        .on("progress", (progress) =>
            console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta))
        //Exposes all youtube-dl events, for example:
        //[download] Destination: output.mp4 -> eventType = download and eventData = Destination: output.mp4
        .on("youtubeDlEvent", (eventType, eventData) => console.log(eventType, eventData))
        .on("error", (error) => console.error(error))
        .on("close", () => console.log("done"));
}



