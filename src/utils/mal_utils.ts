import {IncomingMessage, ServerResponse} from "http";
import {utils} from "./utils";
const querystring = require('querystring');
var request = require('request');
const pkceChallenge = require("pkce-challenge");
const open = require('open');
var http = require('http');
import ConfigFile from "./ConfigFile";
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

export const enum STATUS {
    watching= "watching",
    completed = 'completed',
    on_hold="on_hold",
    dropped = "dropped",
    plan_to_watch = "plan_to_watch",
}

export const enum SORT {
    list_score= "list_score",
    list_updated_at = 'list_updated_at',
    anime_title="anime_title",
    anime_start_date = "anime_start_date",
    anime_id = "anime_id",
}

interface AnimeWatchInfo{
    node: {id: number, title:string, main_picture:{large:string, medium:string}, start_season:{year:number, season:String}},
    list_status: {status:string, score:number, num_watched_episodes:number, is_rewatching:boolean, start_date:Date, finish_date:Date}
}

let ID:string;
export default class MyAnimeList
{
    declare readonly CLIENT_ID:string;
    constructor(CLIENT_ID:string)
    {
        this.CLIENT_ID = CLIENT_ID
        ID = CLIENT_ID
    }
    private async create_auth(cb: any)
    {
        const challenge = pkceChallenge(128);
        const url = "https://myanimelist.net/v1/oauth2/authorize?";

        const data = querystring.stringify({
            response_type: 'code',
            client_id: this.CLIENT_ID,
            code_challenge: challenge.code_verifier,
        });

        let server = http.createServer(async function (req: IncomingMessage, res: ServerResponse)
        {
            let params = new URLSearchParams(req.url!.substring(2));
            let code = params.get('code')
            res.write('Success');
            res.end();
            server.close()
            if (code !== null)
                cb(code, challenge.code_verifier)
        })
        server.listen(5678);
        await open(url + data);
    }
   private async refresh_access(nconf:any){
        const url = "https://myanimelist.net/v1/oauth2/token";
        let options = {
            method: "POST",
            url: url,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            form: {
                grant_type: "refresh_token",
                refresh_token: nconf.get('token')['refresh_token'],
                client_id: ID,
            }
        };
        return await this.configure_token(options,nconf)
    }
    private async configure_token(options:any, nconf:ConfigFile){
        return new Promise(resolve =>
        {
            request(options, function (error: any, response: any)
            {
                if (error) throw new Error(error);
                let token = JSON.parse(response.body);
                token['access_token_expires_on'] = token['expires_in'] + Date.now()
                token['refresh_token_expires_on'] = 2629800000 + Date.now()
                nconf.set('token', token)
                resolve(token['token_type'] + ' ' + token['access_token'])
            });
        })
    }
    private async get_token()
    {
        return new Promise(async resolve =>
        {
            let nconf = new ConfigFile(utils.getConfigPath())
            if (nconf.get('token') !== undefined && nconf.get('token')['access_token_expires_on'] > Date.now())
            {
                resolve(nconf.get('token')['token_type'] + ' ' + nconf.get('token')['access_token'])
            } else if (nconf.get('token') !== undefined && nconf.get('token')['refresh_token_expires_on'] > Date.now())
            {
                resolve(await this.refresh_access(nconf))
            } else
            {
                const self = this;
                await this.create_auth(async function (code: string, verifier: string)
                {
                    const url = "https://myanimelist.net/v1/oauth2/token";
                    let options = {
                        method: "POST",
                        url: url,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        form: {
                            grant_type: "authorization_code",
                            client_id: ID,
                            code: code,
                            code_verifier: verifier,
                        }
                    };
                    resolve(await self.configure_token(options, nconf))
                })
            }
        })
    }

    async search(q: string, parameters: {limit?: number, offset?: number} = {limit: 100, offset: 0}): Promise<Array<AnimeWatchInfo>>
    {
        let token = await this.get_token()
        const url = "https://api.myanimelist.net/v2/anime?"
        const data = querystring.stringify({
            q: q,
            limit: parameters.limit,
            offset: parameters.offset,
            fields: 'start_date,start_season'
        });

        let response = await fetch(url + data, {headers:{"Authorization": token}})
        let man = (await response.json()).data
        return man
    }

    async get_watch_list(parameters: { limit?: number, offset?: number, status?: STATUS, sort?: SORT, user?:string} = {limit: 100, offset: 0, user:"@me"}): Promise<Array<AnimeWatchInfo>>
    {
        let token = await this.get_token()
        let raw_dat = new Map<string, any>()
        raw_dat.set('fields', "list_status,start_season,start_date")
        raw_dat.set('limit', 100)
        raw_dat.set("offset",0)
        raw_dat.set('user', "@me")

        for (const key of Object.entries(parameters))
            if (key[1] !== undefined)
                raw_dat.set(key[0], key[1])

        let obj = Array.from(raw_dat).reduce((obj, [key, value]) => (
            Object.assign(obj, {[key]: value}) // Be careful! Maps can have non-String keys; object literals can't.
        ), {});

        const data = querystring.stringify(obj);
        const url = `https://api.myanimelist.net/v2/users/${raw_dat.get('user')}/animelist?`
        let response = await fetch(url + data, { headers: {"Authorization": token}})

        return (await response.json()).data
    }
    async update_list(anime_id:number, parameters: { status?: STATUS, is_rewatching?:boolean, score?:number,num_watched_episodes?:number, priority?:number, num_times_rewatched?:number, rewatch_value?:number, tags?:string, comments?:string} = {}){
        let token = await this.get_token()
        let urlencoded = new URLSearchParams();
        for (const key of Object.entries(parameters))
            if (key[1] !== undefined)
                urlencoded.append(key[0], key[1]);
        let response = await fetch(`https://api.myanimelist.net/v2/anime/${anime_id}/my_list_status`,{body:urlencoded, method:'PUT', headers: {"Authorization":token, "Content-Type":"application/x-www-form-urlencoded"}, redirect: 'follow'})
        return await response.json()
    }

    async delete_list_item(anime_id:number){
        let token = await this.get_token()
        await fetch(`https://api.myanimelist.net/v2/anime/${anime_id}/my_list_status`,{method:'DELETE', headers: {"Authorization":token}})
    }
}