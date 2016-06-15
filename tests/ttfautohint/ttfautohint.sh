#!/bin/bash
if command -v docker >/dev/null 2>&1; then
	exec docker run --rm -a STDIN -a STDOUT -a STDERR -i ttfautohint:1.5 "$@"
else
	exec ttfautohint "$@"
fi
