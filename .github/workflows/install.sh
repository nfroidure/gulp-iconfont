#!/bin/bash

sudo apt-get update
sudo apt-get install -y qt5-qmake qtbase5-dev
mkdir -p ../bin/ttfautohint && cd ../bin/ttfautohint

export FT_VERSION=2.13.2
export HB_VERSION=2.6.7
export TA_VERSION=1.8.4

wget http://download.savannah.gnu.org/releases/freetype/freetype-"$FT_VERSION".tar.gz
tar xjf freetype-"$FT_VERSION".tar.gz
(cd freetype-"$FT_VERSION" && ./configure --without-harfbuzz && sudo make install && sudo make distclean)
wget https://www.freedesktop.org/software/harfbuzz/release/harfbuzz-"$HB_VERSION".tar.xz
tar xjf harfbuzz-"$HB_VERSION".tar.xz
(cd harfbuzz-"$HB_VERSION" && ./configure && sudo make install)
(cd freetype-"$FT_VERSION" && ./configure && sudo make install)
wget http://downloads.sourceforge.net/project/freetype/ttfautohint/"$TA_VERSION"/ttfautohint-"$TA_VERSION".tar.gz
tar xzf ttfautohint-"$TA_VERSION".tar.gz
(cd ttfautohint-"$TA_VERSION" && ./configure && sudo make install)

export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
