#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create ffmpeg directory if it doesn't exist
const ffmpegDir = './ffmpeg';
if (!fs.existsSync(ffmpegDir)) {
    fs.mkdirSync(ffmpegDir);
}

function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${path.basename(filepath)}...`);
        
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`✓ Downloaded ${path.basename(filepath)}`);
                resolve();
            });
            
        }).on('error', (err) => {
            fs.unlink(filepath, () => {}); // Delete partial file
            reject(err);
        });
    });
}

async function downloadFFmpegFiles() {
    console.log('🔄 Downloading FFmpeg.wasm files for local use...\n');
    
    const files = [
        {
            url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
            path: './ffmpeg/ffmpeg-core.js'
        },
        {
            url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
            path: './ffmpeg/ffmpeg-core.wasm'
        },
        {
            url: 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js',
            path: './ffmpeg/ffmpeg.js'
        },
        {
            url: 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/814.ffmpeg.js',
            path: './ffmpeg/814.ffmpeg.js'
        }
    ];
    
    try {
        for (const file of files) {
            await downloadFile(file.url, file.path);
        }
        
        console.log('\n✅ All FFmpeg files downloaded successfully!');
        console.log('📁 Files saved to ./ffmpeg/ directory');
        console.log('🚀 You can now run the converter offline!');
        
    } catch (error) {
        console.error('\n❌ Download failed:', error.message);
        console.log('⚠️  Some files may not exist - this might be normal.');
        console.log('🔄 Try running the server and see if it works anyway.');
    }
}

downloadFFmpegFiles();
