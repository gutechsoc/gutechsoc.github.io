#!/bin/bash
if [[ $1 == *".original-files"* ]]; then
  echo "Already converted $1"
  exit
fi

seded=$(echo $1 | sed -E 's/\.(png|jpg|jpeg)/\.webp/');
echo $seded;
cwebp -q 100 $1 -o $seded;
mv $1 ./images/.original-files/
