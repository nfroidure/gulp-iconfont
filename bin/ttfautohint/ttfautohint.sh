#!/bin/bash
DOCKER_IMAGE="ttfautohint"

if command -v docker >/dev/null 2>&1 && test ! -z "$(docker images -q "$DOCKER_IMAGE" 2> /dev/null)"; then
	exec docker run --rm -a STDIN -a STDOUT -a STDERR -i "$DOCKER_IMAGE" "$@"
else
	exec ttfautohint "$@"
fi
