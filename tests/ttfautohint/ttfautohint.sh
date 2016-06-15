#!/bin/bash

exec docker run --rm -a STDIN -a STDOUT -a STDERR -i ttfautohint:1.5 "$@"
