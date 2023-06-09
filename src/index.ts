import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { run } from './critics/runner';

const init = async () => {
    const report_yaml_path = path.join(__dirname, '../report.yaml')
    const candidate_txt_path = path.join(__dirname, '../candidates.txt')

    fs.rmSync(report_yaml_path, { force: true })

    const fileStream = fs.createReadStream(candidate_txt_path);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const repo of rl) {
        const yaml_result = await run(repo).catch((error) => console.error(error))
        if (yaml_result) {
            fs.appendFileSync(report_yaml_path, yaml_result);
        }
    }
}

init()