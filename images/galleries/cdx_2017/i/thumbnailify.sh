#! /bin/bash

for i in *.jpg; do
    if [ "$i" -nt "../t/$i" ]; then
        convert "$i" -resize 200x200 "../t/$i";
    fi
done;
