FROM ubuntu:22.04

RUN apt-get update \
    && apt-get install -y wget build-essential pkg-config qt5-qmake qtbase5-dev \
    && mkdir -p /ttfautohint && cd /ttfautohint

ENV FT_VERSION=2.13.2
ENV HB_VERSION=2.6.7
ENV TA_VERSION=1.8.4

RUN wget http://download.savannah.gnu.org/releases/freetype/freetype-"$FT_VERSION".tar.gz
RUN tar xf freetype-"$FT_VERSION".tar.gz
RUN (cd freetype-"$FT_VERSION" && ./configure --without-harfbuzz && make install && make distclean)
RUN wget https://www.freedesktop.org/software/harfbuzz/release/harfbuzz-"$HB_VERSION".tar.xz
RUN tar xf harfbuzz-"$HB_VERSION".tar.xz
RUN (cd harfbuzz-"$HB_VERSION" && ./configure && make install)
RUN (cd freetype-"$FT_VERSION" && ./configure && make install)
RUN wget https://downloads.sourceforge.net/project/freetype/ttfautohint/"$TA_VERSION"/ttfautohint-"$TA_VERSION".tar.gz
RUN tar xzf ttfautohint-"$TA_VERSION".tar.gz
RUN (cd ttfautohint-"$TA_VERSION" && ./configure && make install)

ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

ENTRYPOINT ["/usr/local/bin/ttfautohint"]
CMD ["/dev/stdin", "/dev/stdout"]
