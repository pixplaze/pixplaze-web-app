#!/usr/bin/env bash
#
# Builds the Docker image and packs everything needed for deployment into dist.
# The version is taken from "version" in package.json.
#
# Output (dist):
#   pixplaze-web-app-<version>.tar.gz   image archive for 'docker load'
#   version.env                         PIXPLAZE_TAG=<version> for docker compose
#   docker-compose.yml                  copy of the compose file
#
# Environment:
#   PLATFORM   target image platform (default: linux/amd64)
#
# Usage:
#   scripts/build-image.sh
#

set -euo pipefail

cd "$(dirname "$0")/.."

platform="${PLATFORM:-linux/amd64}"
image="pixplaze-web-app"
dist_dir="dist"

version="$(node -p "require('./package.json').version")"
echo "Building $image:$version for $platform"

docker build --platform "$platform" \
    --label org.opencontainers.image.version="$version" \
    -t "$image:$version" --load .

rm -rf "$dist_dir"
mkdir -p "$dist_dir"
docker save "$image:$version" | gzip > "$dist_dir/$image-$version.tar.gz"
echo "PIXPLAZE_TAG=$version" > "$dist_dir/version.env"
cp docker-compose.yml "$dist_dir/"

echo
echo "Done: $dist_dir"
ls -1 "$dist_dir"
