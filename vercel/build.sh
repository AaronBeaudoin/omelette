#!/bin/bash
# Deploys to Vercel with the Vercel Build Output API.
# https://vercel.com/docs/build-output-api/v3

# Feel free to run this script locally to see how it works.
# TLDR: It creates a `.vercel/` directory for Vercel to deploy.

# ————————————————————————————————————————————————————————————————————————————————

# 1. BUILD
# Run NPM build script, just like you do locally to preview.
# This generates the `dist/` directory in Vercel's build environment.
npm run build

# ————————————————————————————————————————————————————————————————————————————————

# 2. PREPARE
# Remove existing `.vercel/` directory (if applicable).
# Create a new `.vercel/` directory.
rm -rf .vercel
mkdir -p .vercel/output

# ————————————————————————————————————————————————————————————————————————————————

# 3. STRUCTURE
# Copy the `.vercel/output/` directory skeleton from `vercel/output/`.
# Copy client build output to `.vercel/output/static/` directory.
cp -a vercel/output/. .vercel/output
cp -a dist/client/. .vercel/output/static

# ————————————————————————————————————————————————————————————————————————————————

# 4. COMPILE
# Bundle/compile data function entrypoint to a single file.
# (This ensures all dependencies are bundled into the file.)
cd .vercel/output/functions
npx ncc build --minify --out ./data.func data.func/index.js

# ————————————————————————————————————————————————————————————————————————————————

# 5. PARTY
# Isn't it awesome that all this happened automatically?
echo "Deployment build script finished! 🎉 🎉 🎉 "
