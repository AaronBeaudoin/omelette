[[ $1 == "local" ]] && local="--local" && npm run build:manifest &&
npx concurrently "wrangler dev wrangler/worker/entrypoint $local --node-compat \
--define __VUE_OPTIONS_API__:true --define __VUE_PROD_DEVTOOLS__:false" npm:dev:manifest
