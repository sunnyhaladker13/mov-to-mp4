#!/usr/bin/env python3
"""
Download FFmpeg.wasm files locally to avoid CORS issues
"""

import os
import urllib.request
import urllib.error

def download_file(url, filename):
    """Download a file from URL to local filename"""
    try:
        print(f"Downloading {filename}...")
        urllib.request.urlretrieve(url, filename)
        print(f"✓ Downloaded {filename}")
        return True
    except urllib.error.URLError as e:
        print(f"✗ Failed to download {filename}: {e}")
        return False

def main():
    # Create ffmpeg directory
    ffmpeg_dir = "ffmpeg"
    if not os.path.exists(ffmpeg_dir):
        os.makedirs(ffmpeg_dir)
    
    # FFmpeg.wasm files to download
    base_url = "https://unpkg.com/@ffmpeg"
    files_to_download = [
        # Core FFmpeg files
        (f"{base_url}/core@0.12.6/dist/umd/ffmpeg-core.js", f"{ffmpeg_dir}/ffmpeg-core.js"),
        (f"{base_url}/core@0.12.6/dist/umd/ffmpeg-core.wasm", f"{ffmpeg_dir}/ffmpeg-core.wasm"),
        (f"{base_url}/core@0.12.6/dist/umd/ffmpeg-core.worker.js", f"{ffmpeg_dir}/ffmpeg-core.worker.js"),
        # Main FFmpeg library
        (f"{base_url}/ffmpeg@0.12.10/dist/umd/ffmpeg.js", f"{ffmpeg_dir}/ffmpeg.js"),
    ]
    
    print("Downloading FFmpeg.wasm files...")
    success_count = 0
    
    for url, filename in files_to_download:
        if download_file(url, filename):
            success_count += 1
    
    if success_count == len(files_to_download):
        print(f"\n✓ All {success_count} files downloaded successfully!")
        print("You can now run the server and use FFmpeg.wasm offline.")
    else:
        print(f"\n⚠ Only {success_count}/{len(files_to_download)} files downloaded successfully.")
        print("Some features may not work properly.")

if __name__ == "__main__":
    main()
