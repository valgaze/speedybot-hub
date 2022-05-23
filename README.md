## wishlist for features

- <@camera>, jpg/png fileuploads
- <@webhook>
- Support for secret decoding w/ crypto api
- storage, super easy somehow
## 

tl;dr:

- github actions that will deploy worker, read in secrets, run a node script
- Would love: git command from local users machine to create github repo, add secrets

------

## Inspiration

https://www.serviops.ca/a-full-ci-cd-pipeline-for-cloudflare-workers-with-github-actions/



Example one where they write ~/config/clodflare.toml?

Good docs on token: https://dev.to/kleeut/cloudflare-workers-continuous-deployment-with-github-actions-3jo6

## Various

https://help.github.com/articles/creating-a-workflow-with-github-actions/

----
4 ways to deploy this thing

1) copy & paste index.js into cloudflare, register webhook with CLI 

2) clone it and wrangler publish

2a) npx speedybot-hub setup, then wrangler publish

3) Dope: 100% inside github, edit dev/prod botz