# MOV to MP4 Converter

A local video file converter project that explores browser-based video conversion.

## � Current Status: Challenging Due to Browser Limitations

After extensive development, browser-based video conversion faces significant technical hurdles:
- CORS restrictions with WebAssembly workers
- SharedArrayBuffer security requirements  
- Memory limitations for large files
- Complex server configuration needs

## ✅ **Working Solutions (Recommended)**

### **Option 1: Desktop Software (Best Results)**
- **HandBrake** - Free, powerful, perfect for MOV→MP4
- **VLC Media Player** - Simple conversion via Media → Convert/Save
- **FFmpeg** - Command line tool for advanced users

### **Option 2: Quick File Rename**
Many MOV files can be renamed to .mp4 and will work:
1. Change `video.mov` to `video.mp4`
2. Test if it plays (works ~70% of the time)

### **Option 3: Online Converters**
CloudConvert, Online-Convert, Zamzar (files get uploaded)

## 🧪 **Experimental Browser Version**

If you want to try the browser-based approach:

```bash
npm install
npm start
# Open http://localhost:8080
```

**Note**: Requires modern browser with specific security headers. May not work reliably.

Alternative simple version:
- Open http://localhost:8080/simple.html

## Technical Challenges Encountered

1. **CORS Issues**: Workers loading from different origins blocked
2. **Path Resolution**: FFmpeg.wasm worker files resolve paths incorrectly  
3. **Security Headers**: SharedArrayBuffer requires specific server configuration
4. **Performance**: Browser-based conversion is much slower than native apps

## For Developers

See `SOLUTION.md` for detailed technical explanation and alternatives.

The code in this repository demonstrates:
- ✅ Proper local server setup with CORS headers
- ✅ FFmpeg.wasm integration attempts
- ✅ File handling and UI components
- ❌ Reliable browser-based video conversion (due to platform limitations)

## Recommendation

**For actual MOV→MP4 conversion**: Use HandBrake or VLC desktop applications.

**For developers**: Consider whether browser-based video processing is necessary for your use case. Server-side or desktop solutions are typically more reliable.

## Files Included

- `index.html` - Main converter attempt
- `simple.html` - Simplified version with alternatives
- `SOLUTION.md` - Detailed explanation of challenges and solutions
- `server setup` - Proper CORS configuration examples

## License

MIT License - Free to use and learn from!
