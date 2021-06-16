
export class Anime{
    name: string = ''
    href: string = ''
    img: string = ''
    released: number = 0
    constructor(name: string, href:string, img:string, released:number)
    {
        this.name = name
        this.href = href
        this.img = img
        this.released = released
    }
}
