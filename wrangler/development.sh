[[ $1 == "local" ]] && LOCAL="--local"
COMMAND="wrangler dev wrangler/worker/entry-production $LOCAL --node-compat \
--define __VUE_OPTIONS_API__:true --define __VUE_PROD_DEVTOOLS__:false"

npm run build:manifest
npx concurrently "$COMMAND" npm:dev:manifest
