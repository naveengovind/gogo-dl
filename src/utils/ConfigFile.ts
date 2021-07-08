import * as fs from 'fs';

export default class ConfigFile
{
    private data: any;
    private readonly path: string;
    constructor(path: string)
    {
        this.path = path
        const raw = fs.readFileSync(path,'utf8');
        if(raw.trim().length === 0){
            this.data = JSON.parse('{}')
        }else{
            try
            {
                this.data = JSON.parse(raw)
            }catch (e)
            {
                this.data = JSON.parse('{}')
            }
        }
    }
    set(key:string, value:any){
        this.data[key] = value
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }
    get(key:string):any{
        if(key in this.data)
            return this.data[key]
        else
            return undefined
    }
    clear(){
        this.data = JSON.parse('{}')
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }
}