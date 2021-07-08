import {Anime} from "../models/Anime";
import {MetaData} from "../models/MetaData";
import {utils} from "../utils/utils";
import got from "got";

export default abstract class site {
    private readonly base_url: string;
    protected constructor(base_url: string) {
        this.base_url = base_url
    }
    abstract getVideoSrc(href: string, episode: number, server: string): Promise<string | undefined>;

    //search(keyword: string): Promise<Array<Anime>>

    abstract getMetaData(href: string): Promise<MetaData>;

    async slugExists(href: string): Promise<boolean> {
        const myURL = new URL(href);
        let url = this.base_url + href.replace(myURL.origin, '')
        try
        {
            return (await got(url).then(response => {return response.statusCode === 200;}))!
        }catch (e)
        {
            return false
        }
    }
}