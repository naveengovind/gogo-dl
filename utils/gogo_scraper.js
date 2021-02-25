const Anime = require('../models/Anime')
const MetaData = require('../models/MetaData')
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const BASE_URL = 'https://www2.gogoanime.sh';

let gogo_scraper = {

    getEpMetaData: async function(href)
    {
        let url = BASE_URL + href
        return await got(url).then(response => {
            const dom = new JSDOM(response.body);
            let eplist = dom.window.document.getElementById('episode_page').children
            let lastEp = eplist.item(eplist.length-1).getElementsByTagName('a').item(0).getAttribute('ep_end')
            return new MetaData(Number(lastEp))
        }).catch(err => {
            return undefined
        });
    },

    search: async function (keyword)
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
            return []
        });
    },

    getVidStreamURL: async function (href, episode)
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

    },

    getVideoSrc: async function (url) {
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
}
module.exports = gogo_scraper
