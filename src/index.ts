#! /usr/bin/env node
import * as yargs from "yargs"
import {driver} from "./driver/driver";
import {Argv} from "yargs";
import {utils} from "./utils/utils";
import ConfigFile from "./utils/ConfigFile";
import chalk from "chalk";

interface Arguments {
    title: string
    w: boolean
    d:boolean
    s: string
    mpv:boolean
    vlc:boolean
}
const DEBUG = false
let nconf = new ConfigFile(utils.getConfigPath())
function main() {
    try
    {
        if(!DEBUG)
        {
            console.warn = () =>
            {
            };
            console.error = () =>
            {
            };
        }
        yargs.scriptName("gogo-dl")
            .usage('$0 <cmd> [args]')

            .command('dl [title]', 'download anime into your current directory', (yargs: Argv<{}>) =>
            {
                yargs.positional('title', {
                    type: 'string',
                    default: 'JoJo',
                    describe: 'title of the anime'
                })
            }, async function (argv: Arguments)
            {
                await driver.askForShow(argv.title, 'dl', '')
            })

            .command('watch [title]', 'stream the anime through a media player(VLC)', (yargs: Argv<Arguments>) =>
            {
                yargs.positional('title', {
                    type: 'string',
                    default: 'JoJo',
                    describe: 'title of the anime'
                }).options({
                    'mpv': {
                        alias: 'm',
                        type: 'boolean',
                        default: false,
                        description: 'use mpv'
                    },
                    'vlc': {
                        alias: 'v',
                        type: 'boolean',
                        default: false,
                        description: 'use vlc'
                    }
                })
            }, async function (argv: Arguments)
            {
                if (argv.mpv)
                    await driver.askForShow(argv.title, 'watch', 'mpv')
                else if (argv.vlc)
                    await driver.askForShow(argv.title, 'watch', 'vlc')
                else
                    await driver.askForShow(argv.title, 'watch', undefined)
            })

            .command('list', 'open your watch list', (yargs: Argv<Arguments>) =>
            {
                yargs.options({
                    'download': {
                        alias: 'd',
                        type: 'boolean',
                        default: false,
                        description: 'download video from watch list'
                    }, 'watch': {
                        alias: 'w',
                        type: 'boolean',
                        default: false,
                        description: 'watch video from watch list'
                    },
                    'mpv': {
                        alias: 'm',
                        type: 'boolean',
                        default: false,
                        description: 'use mpv'
                    },
                    'vlc': {
                        alias: 'v',
                        type: 'boolean',
                        default: false,
                        description: 'use vlc'
                    }
                })
            }, async function (argv: Arguments)
            {
                if(nconf.get('token') === undefined){
                    console.log(chalk.yellowBright("Authentication is required for this action\nrun") + ("\"gogo auth\"") + chalk.yellowBright("to authenticate with MAL"))
                    process.exit(0)
                }
                if (argv.w)
                {
                    if (argv.mpv)
                        await driver.askForShow('watch', 'list', 'mpv')
                    else if (argv.vlc)
                        await driver.askForShow('watch', 'list', 'vlc')
                    else
                        await driver.askForShow('watch', 'list', undefined)
                } else
                    await driver.askForShow('dl', 'list', '')
            }).command('auth', 'authenticate gogo-dl with MAL', (yargs: Argv<Arguments>) =>
            {

            }, async function (argv: Arguments)
            {
                if(await utils.getMal().reauthenticate()!== undefined ){
                    console.log(chalk.greenBright('successfully authenticated'))
                }
            })
            .command('add [title]', 'add a show to your watch list', (yargs: Argv<Arguments>) =>
            {
                yargs.positional('title', {
                    type: 'string',
                    describe: 'title of the anime'
                })
            }, async function (argv: Arguments)
            {
                if(nconf.get('token') === undefined){
                    console.log(chalk.yellowBright("Authentication is required for this action\nrun") + ("\"gogo auth\"") + chalk.yellowBright("to authenticate with MAL"))
                    process.exit(0)
                }
                await driver.askForShow(argv.title, 'add', '')
            })
            .command('remove [title]', 'remove a show from your watch list', () =>
            {

            }, async function (argv: Arguments)
            {
                if(nconf.get('token') === undefined){
                    console.log(chalk.yellowBright("Authentication is required for this action\nrun") + ("\"gogo auth\"") + chalk.yellowBright("to authenticate with MAL"))
                    process.exit(0)
                }
                await driver.askForShow(argv.title, 'remove', '')
            }).showHelpOnFail(true)
            .demandCommand(1, '')
            .argv
    }catch (e)
    {

    }
}

main();