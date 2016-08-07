cd i
ls | cat -n | while read n f; do mv "$f" "$n.jpg"; done 
for f in *; do
    convert "$f" -auto-orient -resize 200x200 "../t/$f"
done;
