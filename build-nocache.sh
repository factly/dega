#!/bin/sh

# Create a unique cache bust value
CACHEBUST=$(date +%s)

# Pass the cache bust value as a build argument
docker-compose build --no-cache --build-arg CACHEBUST=$CACHEBUST dega-studio
docker-compose up
