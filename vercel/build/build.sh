#!/bin/bash
# Build a Vercel deployment using the Build Output API.
# https://vercel.com/docs/build-output-api/v3

# Feel free to run this script locally to see how it works.
# TLDR: It creates a `.vercel/` directory for Vercel to deploy.

# ————————————————————————————————————————————————————————————————————————————————

# 1. PREPARE
# Remove existing `.vercel/` directory (if applicable).
# Create a new `.vercel/` directory.
rm -rf .vercel
mkdir .vercel

# ————————————————————————————————————————————————————————————————————————————————

# 2. STRUCTURE
# Copy the `.vercel/output/` directory skeleton from `vercel/output/`.
# Copy client build output to `.vercel/output/static/` directory.
cp -a vercel/output/. .vercel/output
cp -a dist/client/. .vercel/output/static

# ————————————————————————————————————————————————————————————————————————————————

# 3. COMPILE
# Bundle/compile serverless/edge function entrypoints.
node $(dirname ${BASH_SOURCE[0]})/dispatch.mjs
node $(dirname ${BASH_SOURCE[0]})/functions.mjs
node $(dirname ${BASH_SOURCE[0]})/pages.mjs

# ————————————————————————————————————————————————————————————————————————————————

# 4. PARTY
# Isn't it awesome that all this happened automatically?
echo "Deployment build script finished! 🎉 🎉 🎉 "
