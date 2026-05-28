#!/bin/bash

# Ensure thumbnails directory exists
mkdir -p images/thumbnails

echo "Checking for missing thumbnails..."

# Detect image processing tool
if command -v sips >/dev/null 2>&1; then
    TOOL="sips"
elif command -v mogrify >/dev/null 2>&1; then
    TOOL="imagemagick"
else
    echo "Error: Neither 'sips' nor 'ImageMagick' found. Please install one to generate thumbnails."
    exit 1
fi

count=0
for img in images/*.png; do
    # Skip files already in thumbnails directory or system files
    filename=$(basename "$img")
    thumb="images/thumbnails/$filename"
    
    if [ ! -f "$thumb" ]; then
        echo "Generating thumbnail for $filename..."
        if [ "$TOOL" == "sips" ]; then
            sips -Z 200 "$img" --out "$thumb" > /dev/null 2>&1
        else
            convert "$img" -resize 200 "$thumb"
        fi
        ((count++))
    fi
done

if [ $count -eq 0 ]; then
    echo "All thumbnails are up to date."
else
    echo "Successfully generated $count new thumbnails."
fi
