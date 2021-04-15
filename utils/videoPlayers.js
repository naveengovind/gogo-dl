
const cp = require('child_process')
const vlcCommand = require('vlc-command')
let videoPlayers = {

    //TODO fix backwards episode playing
    iina: async function(urls) {
        let str = ''
        urls.forEach(url => (str = url + ' ' + str + ' '))
        str = str.trim()
        cp.exec('/Applications/IINA.app/Contents/MacOS/iina-cli --queue ' + str)
    },

    vlc: async function(urls) {
        let str = ''
        urls.forEach(url => (str += url + ' '))
        str = ' ' + str.trim()
        vlcCommand(function (err, cmd) {
            if (err) {
                console.log(chalk.redBright('could not find VLC command path make sure you have VLC installed with command line tools'))
                process.exit(1)
            }
            if (process.platform === 'win32') {
                cp.execFile(cmd, [str], function (err, stdout) {
                    if (err) return console.error(err)
                    console.log(stdout)
                })
            } else {
                cp.exec(cmd + str, function (err, stdout) {
                    if (err) return console.error(err)
                    console.log(stdout)
                })
            }
        })
    }
}
module.exports = videoPlayers