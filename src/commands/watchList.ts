import MyAnimeList, {STATUS} from "../utils/mal_utils";
import prompts, {PromptObject} from "prompts";
import chalk from "chalk";
let mal = new MyAnimeList("00d2c5d06cc8ec154ddd8c8c22ace667")
export let watchList = {

    async newShow(id: number)
    {
        await mal.update_list(id,{status:STATUS.watching})
    },

    async removeShow(id: number)
    {
        let options: PromptObject = {
            type: 'select',
            name: 'value',
            message: 'Pick an option',
            choices: [
                {title: 'On Hold', value: STATUS.on_hold},
                {title: 'Dropped', value: STATUS.dropped},
                {title: 'Plan To Watch', value: STATUS.plan_to_watch},
                {title: 'Completed', value: STATUS.completed},
                {title: 'Delete', value: "DELETE"}
            ],
            initial: 0
        }
        const response = await prompts(options);
        if(response.value === "DELETE")
        {
           mal.delete_list_item(id).then(response =>{
               console.log(chalk.green('removed'))
           })
        }else{
            mal.update_list(id, {status: response.value}).then(response => {
                console.log(chalk.green('removed'))
            })
        }
        console.log(chalk.gray('removing ...'))
    }
}