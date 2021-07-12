import EventEmitter from "events";
var emitter = require('events').EventEmitter;

export default abstract class VideoPlayer {
    abstract append(url:string):Promise<void>;
    abstract getPercentPos():Promise<number>;
    abstract getFileName():Promise<string>;

    getEventListener(comp:string, ep:number):EventEmitter{
        let e = new emitter();
        let mont = this
        function delay(ms: number) {
            return new Promise( resolve => setTimeout(resolve, ms) );
        }
        setTimeout(async function () {
                let completed = false
                while (!completed) {
                    let name = await mont.getFileName()
                    if(comp ===  name && await mont.getPercentPos() >= 80)
                    {
                        e.emit('watch_80', {name,ep});
                        completed = true
                    }else
                        await delay(1000)
                }
            }
            , 1000)
        return e;
    };

}