import fs from 'node:fs/promises'
import path from 'node:path'
import * as glob from 'glob';
import * as yaml from 'yaml'

// folder names of critics
const CRITICS = ['pr', 'issue']

export const run = async (repo: string) => {
    console.log(`Runner started for ${repo}`)

    const [owner, name] = repo.split('/')

    const runnable_files = CRITICS.reduce<string[]>((acc, critic) => {
        const files = glob.globSync(`${path.join(__dirname, critic)}/*.{t,j}s`)
        return [...acc, ...files.map(path => path.replace(__dirname, '').slice(1))]
    }, [])

    let result = []

    for (const file_path of runnable_files) {
        const func = await import('./' + file_path)
        const score = await func.default.default(owner, name).catch((error: any) => { })

        if (score !== undefined) {
            // exclude lane result when errored
            result.push({ file_path, score: parseFloat(parseFloat(score).toFixed(1)) })
        }
    }

    // format scores for each lane
    const formatted = result.reduce<Record<string, { totalScore: number, lanes: Record<string, number>[] }>>((acc, { file_path, score }) => {
        const [critic, file_name] = file_path.split('/')
        const [lane] = file_name.split('.')
        if (!acc[critic]) {
            acc[critic] = { totalScore: 0, lanes: [] }
        }
        acc[critic].lanes.push({ [lane]: score })
        acc[critic].totalScore += score
        return acc
    }, {})

    // calculate final average score for each critic
    const formatted_with_avg_score = Object.keys(formatted).reduce<Record<string, { score: number, lanes: Record<string, number>[] }>>((acc, critic) => {
        const obj = formatted[critic]
        return { ...acc, [critic]: { score: parseFloat((obj.totalScore / obj.lanes.length).toFixed(1)), lanes: obj.lanes } }
    }, {})

    if (Object.keys(formatted_with_avg_score).length === 0) {
        throw new Error("No critic lane was successful")
    }
    // calculate average score for repo
    const repo_avg_score = parseFloat((Object.values(formatted_with_avg_score).reduce((sum, critic) => sum + critic.score, 0) / Object.keys(formatted_with_avg_score).length).toFixed(1))

    // convert to yaml file format
    const yaml_string = yaml.stringify({
        [repo]: { score: repo_avg_score, ...formatted_with_avg_score }
    })

    return yaml_string
}
