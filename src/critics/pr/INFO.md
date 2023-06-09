# PR Critic 평가 주안점

Contributor 들의 최근 참여가 있어야함.
Maintainer 들의 최근 참여가 있어야함.

# PR Critic Criteria

- oldest_opened
  - a = 현재 날짜 - 가장 오래된 opened pr의 생성일
  - min((365 - a) / 365, 0) \* 100
- latest_merged
  - a = 현재 날짜 - 가장 최근에 merged 된 pr의 merge 날짜
  - (365 - a) / 365 \* 100
- recent_opened
  - a = 현재 날짜 - 가장 최근에 open 된 pr의 생성일
  - (365 - a) / 365 \* 100
