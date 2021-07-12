import VideoPlayer from "./VideoPlayer";
import mpvAPI from 'node-mpv';
const chalk = require("chalk");

export default class MPV extends VideoPlayer{

    private client: mpvAPI;
    private s_time: number;
    constructor(url: string) {
        super()
        try {
            this.client = new mpvAPI()
            this.client.start().then(a => {this.client.load(url)})
            this.s_time = Date.now()
        } catch(err) {
            console.log(chalk.redBright('could not find MPV command path make sure you have MPV installed\ncheckout: https://mpv.io/installation/ to install it'))
            process.exit(0)
        }
    }private async check(){
        function delay(ms: number) {
            return new Promise( resolve => setTimeout(resolve, ms) );
        }
        let end = Date.now()
        if(end - this.s_time < 5000){
            await delay(5000 - (end - this.s_time))
        }
    }
    async append(url: string){
        await this.check()
        await this.client.append(url)
    }
    async getPercentPos(){
        await this.check()
        return await this.client.getPercentPosition()
    }
    async getFileName(){
        await this.check()
        return await this.client.getFilename("full")
    }


}