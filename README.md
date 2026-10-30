# Eeshan Agarwal

My personal site: a one-screen gallery where about 50,000 particles rebuild into a portrait of me and a 3D sculpture for each project.

Built with plain HTML, CSS, JavaScript, and [three.js](https://threejs.org), with no build step.

## Run it locally

```bash
npx serve .
```

## Visit counter

`api/visit-count.js` is a Vercel function backed by Upstash Redis. Set these in the Vercel project (never commit them):

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
