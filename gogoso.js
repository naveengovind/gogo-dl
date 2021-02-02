/*
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const vgmUrl= 'https://gogo-play.net/load.php?id=MTUxNzMw&title=Shingeki+no+Kyojin%3A+The+Final+Season+Episode+8';

const BASE_URL = 'https://gogoanime.so';

main()
async function main(){
    console.log(await getVideoStream((await search('bleach'))[0].href, 20));
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
async function getVideoStream(href, episode)
{
    let url = BASE_URL + href.substring(href.lastIndexOf('/')+1)+ "-episode-" + episode
    return url
}

async function getVideoSrc(url) {
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
*/
