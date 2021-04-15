#! /usr/bin/env node

const yargs = require('yargs');
const driver = require('./driver/driver')

yargs.scriptName("gogo-dl")
    .usage('$0 <cmd> [args]')

    .command('dl [title]', 'download anime into your current directory', (yargs) => {
        yargs.positional('title', {
            type: 'string',
            default: 'JoJo',
            describe: 'title of the anime'
        })
    }, async function (argv) {
        await driver.askForShow(argv.title, 'dl')
    })

    .command('watch [title]', 'stream the anime through a media player(VLC)', (yargs) => {
        yargs.positional('title', {
            type: 'string',
            default: 'JoJo',
            describe: 'title of the anime'
        })
    }, async function (argv) {
        await driver.askForShow(argv.title, 'watch')
    })

    .command('list', 'open your watch list', (yargs) => {
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
             }
        })
    }, async function (argv) {
        if(argv.w)
            await driver.askForShow('watch', 'list')
        else
            await driver.askForShow('dl', 'list')
    })
    .command('add [title]', 'add a show to your watch list', (yargs) => {
        yargs.positional('title', {
            type: 'string',
            default: 'JoJo',
            describe: 'title of the anime'
        })
    }, async function (argv) {
        await driver.askForShow(argv.title, 'add')
    })
    .command('remove [title]', 'remove a show from your watch list', (yargs) => {

    }, async function (argv) {
        await driver.askForShow(argv.title, 'remove')
    })

    .help()
    .argv



