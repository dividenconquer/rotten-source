import { octokit } from "../../utils/octokit"
import { differenceInDays } from 'date-fns'

type GqlResponse = {
    repository: { recentOpened: { nodes: { createdAt: string }[] } }
}

export default async function (owner: string, name: string): Promise<number> {
    const { repository: { recentOpened: { nodes: [{ createdAt }] } } } = await octokit.graphql<GqlResponse>(`
    query Query($owner: String!, $name: String!){ 
        repository(owner: $owner, name: $name){
            recentOpened: pullRequests(states: [OPEN], last: 1){
                nodes{
                  createdAt
                }
            }
          } 
    }`, {
        owner,
        name
    })
    const diff_in_days = differenceInDays(new Date(), new Date(createdAt))
    return Math.floor(Math.max((365 - diff_in_days), 0) / 365 * 100)
}

