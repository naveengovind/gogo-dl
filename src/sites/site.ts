import {Anime} from "../models/Anime";
import {MetaData} from "../models/MetaData";

export default interface site {
    getVideoSrc(href: string, episode: number): Promise<string>
    //search(keyword: string): Promise<Array<Anime>>
    getMetaData(href: string): Promise<MetaData>
    slugExists(href: string): Promise<boolean>
}