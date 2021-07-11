export class Anime{
    name: string = ''
    href:Map<string, {sub:string, dub:string, uncen:string}> = new Map<string, {sub:string, dub:string, uncen:string}>()
    img: string = ''
    released: number = 0
    id:number = 0
    constructor(name: string, href:Map<string,{sub:string, dub:string, uncen:string}>, img:string, released:number, id:number =0 )
    {
        this.name = name
        this.href = href
        this.img = img
        this.released = released
        this.id = id
    }
}