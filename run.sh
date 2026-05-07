#!/bin/bash

echo "Cleaning up Vite ports (5173 - 5177)..."

# Loop through ports and silently kill any processes using them
for port in {5173..5177}; do
    fuser -k ${port}/tcp 2>/dev/null
done

echo "Ports cleared. Starting It'sEze development server..."
npm run dev
