
<h1 align="center">gogo-dl</h1>
<p align="center">
  <b> Powerful, lightweight, user-friendly tool for downloading anime.</b>
</p>

<img src = "https://github.com/naveengovind/gogo-dl/blob/main/exampleImages/Screen%20Shot%202021-02-02%20at%206.44.33%20PM.png?raw=true" align="center">

## Requirements
- NodeJS 
	- install at [https://nodejs.org/en/](https://nodejs.org/en/)

- VLC (optional, required for streaming)
	- download vlc at [https://www.videolan.org/vlc/](https://www.videolan.org/vlc/)

## Install

Linux, Windows, macOS
```
npm i gogo-dl -g
```
## Features

- Full quality downloads
- Fast high-quality mirrors for streaming and downloading
- Batch downloads
- Fast searching
- Streaming using VLC
	- download VLC at [https://www.videolan.org/vlc/](https://www.videolan.org/vlc/)
- Support for SUB and DUB anime
- Watch List [<mark>NEW</mark>]

## Usage

#### gogo-dl has five sub commands ``` dl``` , ```watch```, ```list```,  ```add```,  ```remove```

*episode range should be entered "[start]-[end]"
* ex:  "13-40"
* this range is inclusive

*you can also enter a single episode
- ex "14"

<br/>

### gogo-dl dl [title]

<br/>

by choosing a show and an episode range you want to watch, gogo-dl will launch VLC, and the show will start downloading

<img src = "https://github.com/naveengovind/gogo-dl/blob/main/exampleImages/Screen%20Shot%202021-02-02%20at%206.44.07%20PM.png?raw=true" align="center"> </img>

#### downloads the episodes to the path you are currently in

<br/>

### gogo-dl watch [title]

<br/>

by choosing a show and an episode range you want to watch, gogo-dl will launch VLC, and the show will start playing

<img src = "https://github.com/naveengovind/gogo-dl/blob/main/exampleImages/Screen%20Shot%202021-02-02%20at%206.42.39%20PM.png?raw=true" align="center">

#### fetches all the episodes and adds them in a queue into your media player(VLC)

<br/>

### gogo-dl add [title]

<br/>

by choosing a show, gogo-dl will add it to a watch list that you can access it using the ```watch``` command

<img src = "https://raw.githubusercontent.com/naveengovind/gogo-dl/main/exampleImages/Screen%20Shot%202021-04-17%20at%2011.41.46%20AM.png" align="center">

#### stores the shows in a JSON file in your home directory

<br/>

### gogo-dl list [title] + flag [-w] or [-d]

<br/>

choose a show from your watch list and an episode range that you want to download[```-d```] or watch[```-w```] depending on the flag in your command (default is download) 

<img src = "https://raw.githubusercontent.com/naveengovind/gogo-dl/main/exampleImages/Screen%20Shot%202021-04-17%20at%2011.40.45%20AM.png" align="center">

<br/>

### gogo-dl remove [title]

<br/>

this command lets you choose a show from your watch list and remove it

<img src = "https://raw.githubusercontent.com/naveengovind/gogo-dl/main/exampleImages/Screen%20Shot%202021-04-17%20at%2012.57.48%20PM.png" align="center">

## Disclaimer

```
gogo-dl was not developed for pirating anime but for educational usage.

It may be illegal to use this in your country,

I am not responsible in any way for the usage of others.
```
