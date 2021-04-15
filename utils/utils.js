const prompts =  require("prompts");
const fs = require("fs");
const chalk = require("chalk");
let utils = {
    async recreateConfig() {
        console.log(chalk.red('unable to open watch list file or file may be corrupt'));
        const response = await prompts({
            type: 'toggle',
            name: 'value',
            message: 'would you like to recreate the file?',
            initial: true,
            active: 'yes',
            inactive: 'no'
        });
        if(response.value)
            fs.unlinkSync(utils.getConfigPath())
        process.exit(0)
    },
    getConfigPath(){
        if(process.platform.startsWith('win')) {
            return require('os').homedir() + '\\.gogoConfig.json'
        }
        else {
            return require('os').homedir() + '/.gogoConfig.json'
        }
    }
}
module.exports = utils