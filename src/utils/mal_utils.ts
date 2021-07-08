import {IncomingMessage, ServerResponse} from "http";
import {utils} from "./utils";
const querystring = require('querystring');
var request = require('request');
const pkceChallenge = require("pkce-challenge");
const open = require('open');
var http = require('http');
import ConfigFile from "./ConfigFile";

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
    refresh_access(nconf:any, cb:any){
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
        this.configure_token(options,cb,nconf)
    }
    private configure_token(options:any, cb:any, nconf:ConfigFile){
        request(options, function (error: any, response: any)
        {
            if (error) throw new Error(error);
            let token = JSON.parse(response.body);
            token['access_token_expires_on'] = token['expires_in'] + Date.now()
            token['refresh_token_expires_on'] = 2629800000 + Date.now()
            nconf.set('token', token)
            cb(token['token_type'] + ' ' + token['access_token'])
        });
    }
    private async get_token(cb: any)
    {
        let nconf = new ConfigFile(utils.getConfigPath())
        if (nconf.get('token') !== undefined && nconf.get('token')['access_token_expires_on'] > Date.now())
        {
            cb(nconf.get('token')['token_type'] + ' ' + nconf.get('token')['access_token'])
        } else if (nconf.get('token') !== undefined && nconf.get('token')['refresh_token_expires_on'] > Date.now())
        {
            this.refresh_access(nconf,cb)
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
                self.configure_token(options,cb,nconf)
            })
        }

    }

    async search(q: string, parameters: {limit?: number, offset?: number} = {limit: 100, offset: 0}): Promise<Array<any>>
    {
        return new Promise(resolve =>
        {
            this.get_token(function (token: string)
            {
                const url = "https://api.myanimelist.net/v2/anime?"
                const data = querystring.stringify({
                    q: q,
                    limit: parameters.limit,
                    offset: parameters.offset,
                    fields: 'start_season'
                });
                let options = {
                    method: "GET",
                    url: url + data,
                    headers: {
                        "Authorization": token,
                    },
                };
                request(options, function (error: any, response: any)
                {
                    if (error) throw new Error(error);
                    resolve(JSON.parse(response.body).data)
                })
            })
        })
    }

    async get_watch_list(parameters: { limit?: number, offset?: number, status?: STATUS, sort?: SORT} = {limit: 100, offset: 0}): Promise<Array<AnimeWatchInfo>>
    {
        return new Promise(resolve =>
        {
            this.get_token(function (token: string)
            {
                const url = "https://api.myanimelist.net/v2/users/@me/animelist?"
                let raw_dat = new Map<string, any>()
                raw_dat.set('fields', "list_status,start_season")
                for (const key of Object.entries(parameters))
                {
                    if (key[1] !== undefined)
                        raw_dat.set(key[0], key[1])
                }
                let obj = Array.from(raw_dat).reduce((obj, [key, value]) => (
                    Object.assign(obj, {[key]: value}) // Be careful! Maps can have non-String keys; object literals can't.
                ), {});
                const data = querystring.stringify(obj);
                let options = {
                    method: "GET",
                    url: url + data,
                    headers: {
                        "Authorization": token,
                    },
                };
                request(options, function (error: any, response: any)
                {
                    if (error) throw new Error(error);
                    resolve((JSON.parse(response.body).data))
                })
            })
        })
    }

}