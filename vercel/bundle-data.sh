cd $(dirname ${BASH_SOURCE[0]})/../.vercel/output/functions/data.func
npx ncc build --minify --out . index.js
