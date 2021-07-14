<h1 align="center">gogo-dl</h1>  
<p align="center">  
 <b> Powerful, lightweight, user-friendly tool for downloading anime.</b>  
</p>  

<img src = "https://i.imgur.com/zyl4wIu.png" align="center">  

## Requirements
- NodeJS
	- install at https://nodejs.org/en/

- aria2 (optional, required for downloading)
	- download aria2 at https://github.com/aria2/aria2/releases or your package manager

- mpv or vlc (optional, required for streaming)
	- mpv is reccomended
	- download mpv at https://mpv.io/installation/ or your package manager
	- download vlc at https://www.videolan.org/ or your package manager

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
- Streaming using mpv  or vlc
- Support for sub and dub anime
- MyAnimeList(MAL) support
	- Syncing watch history with MAL
	- Watch List through MAL

## Usage

#### gogo-dl has five sub commands ``` dl``` , ```watch```, ```list```,  ```add```,  ```remove``` , ```auth```

*episode range should be entered "[start]-[end]"
* ex:  "13-40"
* this range is inclusive

*you can also enter a single episode
- ex "14"

<br/>  

### gogo dl [title]

<br/>  

by choosing a show and an episode range you want to watch, gogo-dl will launch will start downloading  the episodes

<img src = "https://i.imgur.com/YCYXlzr.png" align="center"> </img>  

#### downloads the episodes to the path you are currently in

<br/>  

### gogo watch [title]

<br/>  

by choosing a show and an episode range you want to watch, gogo-dl will launch mpv or vlc, and the show will start playing

<img src = "https://i.imgur.com/Mi8Iwhe.jpeg" align="center">  

#### fetches all the episodes and adds them in a queue into your media player

<br/>  

### gogo auth

<br/>  

This command will launch your browser and ask you to authenticate your MAL account with gogo-dl. This is required to access and modify your watch list and sync your watch/dl history with MAL

<img src = "https://i.imgur.com/Nr4zOw4.png" align="center">  

#### stores the shows in a JSON file in your home directory

<br/>  

### gogo add [title]

<br/>  

by choosing a show, gogo-dl will add it to a watch list that you can access it using the ```list``` command

<img src = "https://i.imgur.com/5yUFRZ8.png" align="center">  

#### stores the shows in a JSON file in your home directory

<br/>  

### gogo list [title] + flag [-w] or [-d]

<br/>  

choose a show from your watch list and an episode range that you want to download[```-d```] or watch[```-w```] depending on the flag in your command (default is download)

  <img src = "https://i.imgur.com/wTlgoBW.png" align="center">
<br/>  

### gogo remove

<br/>  

this command lets you choose a show from your watch list and remove it

<img src = "https://i.imgur.com/ZVBtV6g.png" align="center">  

## Disclaimer

```  
gogo-dl was not developed for pirating anime but for educational usage.  
  
It may be illegal to use this in your country,  
  
I am not responsible in any way for the usage of others.  
```