#!/bin/bash

# MOV to MP4 Converter - Local Server Startup Script
# This sets up the proper environment for FFmpeg.wasm to work locally

echo "🚀 Starting MOV to MP4 Converter..."
echo ""

# Check if http-server is installed
if ! command -v http-server &> /dev/null; then
    echo "📦 Installing http-server..."
    npm install -g http-server
fi

# Create a simple index redirect if needed
if [ ! -f "index.html" ]; then
    echo "❌ index.html not found in current directory"
    exit 1
fi

echo "✅ Starting local server with proper CORS headers..."
echo "📁 Serving files from: $(pwd)"
echo "🌐 Server will be available at: http://localhost:8080"
echo ""
echo "🔧 Server configuration:"
echo "   - CORS enabled for all origins"
echo "   - Proper headers for WebAssembly"
echo "   - SharedArrayBuffer support"
echo ""
echo "📋 To use the converter:"
echo "   1. Open http://localhost:8080 in your browser"
echo "   2. Drop or select a MOV file"
echo "   3. Click Convert to MP4"
echo "   4. Download your converted file"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start http-server with proper configuration
http-server . \
  --port 8080 \
  --cors \
  --header "Cross-Origin-Embedder-Policy: require-corp" \
  --header "Cross-Origin-Opener-Policy: same-origin" \
  --header "Cross-Origin-Resource-Policy: cross-origin" \
  --header "Cache-Control: no-cache" \
  --open
