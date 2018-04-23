#!/usr/bin/env bash
set -e

TAG_NAME=$1

if [ -z $TAG_NAME ]
then
    echo 'ERROR : Tag name is missing.'
    echo 'Tag name is the upstream release tag.'
    echo 'Example : `./release.sh v1.0.0-alpha.2`'
    exit 1
fi

# sync repo with upstream
echo '###############################################################################'
echo '# Starting sync of repo with upstream'
echo '# https://github.com/json-schema-form/json-schema-form-core.git'
echo '###############################################################################'
REMOTES=$(git remote -v)
if [[ $REMOTES != *"upstream"*"https://github.com/json-schema-form/json-schema-form-core.git"* ]]; then
    git remote add upstream https://github.com/json-schema-form/json-schema-form-core.git
fi
git fetch upstream
git co development
git merge upstream/development
git co master
git merge upstream/master

echo '###############################################################################'
echo '# Create branch based on release tag '"$TAG_NAME"
echo '###############################################################################'
git co tags/$TAG_NAME
git co -b release/$TAG_NAME

echo '###############################################################################'
echo '# Install missing deps (babel, babel-cli, rimraf, tv4, objectpath)'
echo '###############################################################################'
yarn add --dev babel babel-cli rimraf
yarn remove tv4
yarn add tv4
yarn remove objectpath
yarn add objectpath

echo '###############################################################################'
echo '# Remove old dist'
echo '###############################################################################'
rm -Rf dist

echo '###############################################################################'
echo '# Change package.json'
echo '# 1. replace package name json-schema-form-core --> talend-json-schema-form-core'
echo '# 2. add prepublish script based on babel only'
echo '# 3. change main file json-schema-form-core.js --> module.js'
echo '###############################################################################'
# replace package name, add prepublish based on babel, change main file
sed -i -e 's/\"json-schema-form-core\"/\"talend-json-schema-form-core\"/g' package.json
lf=$'\n'; sed -i -e "s/\"scripts\": {/\"scripts\": {\\$lf    \"prepublish\": \"babel -d dist .\/src\/ \&\& rimraf dist\/**\/*.spec.js\",/g" package.json
sed -i -e 's/dist\/json-schema-form-core.js/dist\/module.js/g' package.json

echo '###############################################################################'
echo '# Install deps and generate package'
echo '###############################################################################'
yarn


echo '###############################################################################'
echo '# Push branch'
echo '###############################################################################'
git add .
git ci -m "Release $TAG_NAME"
git push origin release/$TAG_NAME

echo '###############################################################################'
echo '# Publish on npm'
echo '###############################################################################'
npm publish
