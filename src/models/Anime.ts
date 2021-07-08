export class Anime{
    name: string = ''
    href:Map<string, {sub:string, dub:string}> = new Map<string, {sub:string, dub:string}>()
    img: string = ''
    released: number = 0
    constructor(name: string, href:Map<string,{sub:string, dub:string}>, img:string, released:number)
    {
        this.name = name
        this.href = href
        this.img = img
        this.released = released
    }
}