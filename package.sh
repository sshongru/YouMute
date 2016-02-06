#!/bin/bash          

echo "-------"
echo "YouMute"
echo "-------"
echo "Packaging ZIP file for Chrome Web Store..."

zip YouMute.zip background.js inject.css inject.js logo.png manifest.json popup.html popup.js

echo "-------"