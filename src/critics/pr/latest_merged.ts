import { octokit } from "../../utils/octokit"
import { differenceInDays } from 'date-fns'

type GqlResponse = {
    repository: { latestMerged: { nodes: { mergedAt: string }[] } }
}

export default async function (owner: string, name: string): Promise<number> {
    const { repository: { latestMerged: { nodes: [{ mergedAt }] } } } = await octokit.graphql<GqlResponse>(`
    query Query($owner: String!, $name: String!){ 
        repository(owner: $owner, name: $name){
            latestMerged: pullRequests(states: [MERGED], last: 1){
                nodes{
                  mergedAt
                }
              }
          } 
    }`, {
        owner,
        name
    })
    const diff_in_days = differenceInDays(new Date(), new Date(mergedAt))
    return Math.floor(Math.max((365 - diff_in_days), 0) / 365 * 100)
}