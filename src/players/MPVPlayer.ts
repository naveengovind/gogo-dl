import VideoPlayer from "./VideoPlayer";
import mpvAPI from 'node-mpv';
const chalk = require("chalk");

export default class MPVPlayer implements VideoPlayer{
    client: mpvAPI;
    constructor(url: string) {
        try {
            this.client = new mpvAPI()
            this.client.start().then(a => {this.client.load(url)})
        } catch(err) {
            console.log(chalk.redBright('could not find MPV command path make sure you have MPV installed\ncheckout: https://mpv.io/installation/ to install it'))
            process.exit(0)
        }
    }
    async append(url: string): Promise<void> {
        await this.client.append(url)
    }

}