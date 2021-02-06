//TODO add in status plotSummary and genre
let MetaData = class MetaData{
    constructor(lastEpisode, type, plotSummary, genre, released, status)
    {
        this.lastEpisode = lastEpisode
        this.status = status;
        this.plotSummary = plotSummary
        this.genre = genre
        this.released = released
    }
}

module.exports = MetaData
