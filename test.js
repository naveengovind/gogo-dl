const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://gogoanime.so';

main()
async function main(){
    (await downloadVideo(await getVideoSrc(await getVidStreamURL((await search('attack on titan'))[12].href, 4)), "testfile"));
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
        console.log(err);
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
        console.log(err);
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
        console.log(err);
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
        console.log(err);
    });
}

async function downloadVideo(url, name) {
    let dest = process.cwd()+"/"+ name + '.mp4'
   // console.log(dest)
    //console.log(url)
    let file = fs.createWriteStream(dest);
    let request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', async function() {
            await file.close();  // close() is async, call cb after close completes.
        });
    }).on('error', async function(err) { // Handle errors
        await fs.unlink(dest, function () {}); // Delete the file async. (But we don't check the result)
    });
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

