#!/bin/bash          

echo "-------"
echo "YouMute"
echo "-------"
echo "Packaging ZIP file for Chrome Web Store..."

zip YouMute.zip inject.css inject.js logo.png manifest.json

echo "-------"