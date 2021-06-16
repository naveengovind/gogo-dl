//TODO add in status plotSummary and genre
export class MetaData{
    lastEpisode: number;
    status: string;
    plotSummary: string;
    genre: string;
    released: number
    constructor(lastEpisode: number = 0, type: string = '', plotSummary: string = '', genre: string = '', released:number = 0, status: string = '')
    {
        this.lastEpisode = lastEpisode
        this.status = status;
        this.plotSummary = plotSummary
        this.genre = genre
        this.released = released
    }
}

