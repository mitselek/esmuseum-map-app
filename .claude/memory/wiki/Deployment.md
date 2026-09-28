# Deployment

Production runs on DigitalOcean App Platform, app `esm-map-app`, in the Entu team
(Entusiastid OÜ, co-run with Argo Roots). Facts with refute commands: `facts/deployment.yaml`.
Source of the discovery: Brilliant KB entry `System/digitalocean-entu`, confirmed with doctl.

## How a change reaches students

1. `git push origin main` runs the pre-push hook (typecheck + full test suite). It is the only gate.
2. App Platform sees the push, builds with `npm run build`, runs `npm run start` on port 8080.
3. The new deployment goes ACTIVE on `esm.entu.ee` and `geokool.esm.ee`, usually in 2-4 minutes.

There is no staging, no preview per branch, and GitHub CI does not block the deploy.
Merging to `main` IS shipping.

## Watching a deploy

```bash
id=e3d523b3-f012-469e-8029-fe6e7339e4da
doctl apps list-deployments $id --context entu --format Cause,Phase --no-header | head -3
```

## Verifying a deploy without logging in

Most pages need an OAuth login, so check the shipped code instead of the screen:

- Fetch `https://esm.entu.ee/`, collect every `/_nuxt/*.js` from the HTML, then every chunk
  those files reference (components such as TaskDetailPanel are lazy chunks and do not appear
  in the HTML). Grep the combined text for the new string or constant.
- Minified code renames constants: search for the value near its use (for example
  `setTimeout(()=>{...},zr)` and then `zr=3e3`).
- CSS: fetch `/_nuxt/*.css` and grep for the utility class (for example `.h-dvh{`).
- This proves what shipped, not how it looks. Screen checks still need a device and a login.

## Rollback

App Platform keeps previous deployments; roll back in DigitalOcean, no git revert needed.

## Known drift

`DEPLOYMENT.md` in the repo describes an old host (`esmuseum.entu.ee`, a server IP). It is wrong.

Related: [[Gotchas]], [[Decisions]].
