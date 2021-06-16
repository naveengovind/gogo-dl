#! /usr/bin/env node

import * as yargs from "yargs"
import {driver} from "./driver/driver";
import {Argv} from "yargs";

interface Arguments {
    title: string
    w: boolean
    d:boolean
    s: string
    mpv:boolean
    vlc:boolean
}

function main() {
    yargs.scriptName("gogo-dl")
        .usage('$0 <cmd> [args]')

        .command('dl [title]', 'download anime into your current directory', (yargs:Argv<{}>) => {
            yargs.positional('title', {
                type: 'string',
                default: 'JoJo',
                describe: 'title of the anime'
            })
        }, async function (argv: Arguments) {
            await driver.askForShow(argv.title, 'dl', '')
        })

        .command('watch [title]', 'stream the anime through a media player(VLC)', (yargs: Argv<Arguments>) => {
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
                    default: true,
                    description: 'use vlc'
                }
            })
        }, async function (argv: Arguments) {
            if(argv.mpv)
                await driver.askForShow(argv.title, 'watch', 'mpv')
            else
                await driver.askForShow(argv.title, 'watch', 'vlc')
        })

        .command('list', 'open your watch list', (yargs:Argv<Arguments>) => {
            //TODO implement watch list searching
            yargs.options( {
                'download':{
                    alias: 'd',
                    type: 'boolean',
                    default: false,
                    description: 'download video from watch list'
                },'watch': {
                    alias: 'w',
                    type: 'boolean',
                    default: false,
                    description: 'watch video from watch list'
                },'search': {
                    alias: 's',
                    type: 'string',
                    default: false,
                    description: 'a key word to search your watchlist'
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
                    default: true,
                    description: 'use vlc'
                }
            })
        }, async function (argv: Arguments) {
            if(argv.w){
                if(argv.mpv)
                    await driver.askForShow('watch', 'list','mpv')
                else
                    await driver.askForShow( 'watch','list', 'vlc')
            }
            else
                await driver.askForShow('dl', 'list', '')
        })
        .command('add [title]', 'add a show to your watch list', (yargs: Argv<Arguments>) => {
            yargs.positional('title', {
                type: 'string',
                describe: 'title of the anime'
            })
        }, async function (argv: Arguments) {
            await driver.askForShow(argv.title, 'add', '')
        })
        .command('remove [title]', 'remove a show from your watch list', () => {

        }, async function (argv : Arguments) {
            await driver.askForShow(argv.title, 'remove', '')
        })

        .help()
        .argv
}

main();

