class MOVConverter {
    constructor() {
        this.ffmpeg = null;
        this.isLoaded = false;
        this.selectedFile = null;
        this.convertedBlob = null;
        
        this.initializeElements();
        this.setupEventListeners();
        
        // Set initial button state
        setTimeout(() => {
            this.updateConvertButtonState();
        }, 100);
        
        this.loadFFmpeg();
    }

    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadButton = document.getElementById('uploadButton');
        this.fileInput = document.getElementById('fileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.removeFile = document.getElementById('removeFile');

        // Conversion elements
        this.convertButton = document.getElementById('convertButton');
        this.conversionStatus = document.getElementById('conversionStatus');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.statusMessage = document.getElementById('statusMessage');

        // Download elements
        this.downloadSection = document.getElementById('downloadSection');
        this.downloadButton = document.getElementById('downloadButton');

        // Error elements
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryButton = document.getElementById('retryButton');
    }

    setupEventListeners() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadButton.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.removeFile.addEventListener('click', () => this.clearFile());

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Conversion events
        this.convertButton.addEventListener('click', () => this.convertFile());

        // Download events
        this.downloadButton.addEventListener('click', () => this.downloadFile());

        // Error handling
        this.retryButton.addEventListener('click', () => this.resetConverter());
    }

    async loadFFmpeg() {
        try {
            // Check browser compatibility first
            if (!this.checkBrowserCompatibility()) {
                this.showError('Your browser doesn\'t support the required features. Please use Chrome 68+, Firefox 79+, Safari 15.2+, or Edge 79+.');
                return;
            }

            this.updateStatus('Loading video converter...');
            console.log('Starting FFmpeg initialization with local files...');
            
            // Initialize FFmpeg
            const { FFmpeg } = FFmpegWASM;
            this.ffmpeg = new FFmpeg();

            // Enable logging for debugging
            this.ffmpeg.on('log', ({ message }) => {
                console.log('FFmpeg log:', message);
            });
            
            // Use ONLY local files - no CDN fallbacks to avoid CORS
            console.log('Loading FFmpeg with local files...');
            await this.ffmpeg.load({
                coreURL: '/ffmpeg-core.js',
                wasmURL: '/ffmpeg-core.wasm',
            });
            
            this.isLoaded = true;
            this.updateStatus('Ready to convert');
            console.log('FFmpeg loaded successfully with local files!');
            
            // Update convert button state now that FFmpeg is ready
            this.updateConvertButtonState();
            
        } catch (error) {
            console.error('Failed to load FFmpeg:', error);
            
            // Provide helpful error message based on the error type
            let errorMessage = 'Failed to load video converter. ';
            
            if (error.message.includes('SharedArrayBuffer')) {
                errorMessage += 'Your browser needs to support SharedArrayBuffer. Try using Chrome, Firefox, or Edge with the latest version.';
            } else if (error.message.includes('Worker')) {
                errorMessage += 'Web Worker loading failed. Make sure you\'re accessing via http://localhost:8080 (not file://).';
            } else if (error.message.includes('CORS')) {
                errorMessage += 'Cross-origin loading blocked. Please make sure the server is running with proper CORS headers.';
            } else if (error.message.includes('fetch')) {
                errorMessage += 'Could not load FFmpeg files. Make sure all files are present in the ./ffmpeg/ directory.';
            } else {
                errorMessage += 'Please check the browser console for details and try refreshing the page.';
            }
            
            this.showError(errorMessage);
        }
    }

    checkBrowserCompatibility() {
        // Check for WebAssembly
        if (typeof WebAssembly === 'undefined') {
            console.error('WebAssembly not supported');
            return false;
        }

        // Check for SharedArrayBuffer (required for FFmpeg.wasm threading)
        if (typeof SharedArrayBuffer === 'undefined') {
            console.warn('SharedArrayBuffer not available - threading disabled');
            // Continue without SharedArrayBuffer, some functionality may be limited
        }

        // Check for specific browser versions
        const ua = navigator.userAgent;
        const isChrome = /Chrome\/(\d+)/.test(ua);
        const isFirefox = /Firefox\/(\d+)/.test(ua);
        const isSafari = /Safari\//.test(ua) && !/Chrome/.test(ua);
        const isEdge = /Edg\/(\d+)/.test(ua);

        if (isChrome) {
            const version = parseInt(ua.match(/Chrome\/(\d+)/)[1]);
            return version >= 68;
        } else if (isFirefox) {
            const version = parseInt(ua.match(/Firefox\/(\d+)/)[1]);
            return version >= 79;
        } else if (isSafari) {
            // Safari version detection is more complex, assume modern Safari works
            return true;
        } else if (isEdge) {
            const version = parseInt(ua.match(/Edg\/(\d+)/)[1]);
            return version >= 79;
        }

        // Unknown browser, let it try
        return true;
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.mov')) {
            this.showError('Please select a valid MOV file.');
            return;
        }

        // Validate file size (limit to 500MB for browser performance)
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            this.showError('File size too large. Please select a file smaller than 500MB.');
            return;
        }

        this.selectedFile = file;
        this.displayFileInfo(file);
        
        // Enable/disable convert button based on FFmpeg loading status
        console.log('FFmpeg loaded status:', this.isLoaded);
        this.updateConvertButtonState();
        this.hideError();
    }

    updateConvertButtonState() {
        // Enable button only if we have a file AND FFmpeg is loaded
        const hasFile = this.selectedFile !== null;
        const ffmpegReady = this.isLoaded;
        
        this.convertButton.disabled = !(hasFile && ffmpegReady);
        
        // Update button text to show status
        if (!ffmpegReady) {
            this.convertButton.textContent = 'Loading converter...';
        } else if (!hasFile) {
            this.convertButton.textContent = 'Select a file first';
        } else {
            this.convertButton.textContent = 'Convert to MP4';
        }
        
        console.log('Convert button state:', {
            hasFile,
            ffmpegReady,
            disabled: this.convertButton.disabled,
            text: this.convertButton.textContent
        });
    }

    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileInfo.style.display = 'flex';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    clearFile() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
        this.updateConvertButtonState();
        this.hideDownload();
        this.hideError();
    }

    async convertFile() {
        if (!this.selectedFile || !this.isLoaded) return;

        try {
            this.showConversion();
            this.updateProgress(0, 'Preparing conversion...');

            // Write input file to FFmpeg file system
            const inputData = new Uint8Array(await this.selectedFile.arrayBuffer());
            await this.ffmpeg.writeFile('input.mov', inputData);
            this.updateProgress(10, 'File loaded...');

            // Set up progress tracking
            this.ffmpeg.on('progress', ({ progress }) => {
                const percentage = Math.round(progress * 100);
                this.updateProgress(Math.max(15, percentage), 'Converting video...');
            });

            // Execute FFmpeg conversion with quality preservation
            this.updateProgress(15, 'Analyzing video streams...');
            
            try {
                // Attempt transmuxing (copy streams without re-encoding)
                await this.ffmpeg.exec([
                    '-i', 'input.mov',
                    '-c:v', 'copy',
                    '-c:a', 'copy',
                    '-movflags', '+faststart',
                    '-y', // Overwrite output file
                    'output.mp4'
                ]);
                this.updateProgress(90, 'Finalizing conversion...');
            } catch (transmuxError) {
                console.log('Transmuxing failed, attempting re-encoding:', transmuxError);
                this.updateProgress(20, 'Re-encoding required for compatibility...');
                
                // If transmuxing fails, re-encode with high quality settings
                await this.ffmpeg.exec([
                    '-i', 'input.mov',
                    '-c:v', 'libx264',
                    '-preset', 'medium',
                    '-crf', '18',
                    '-c:a', 'aac',
                    '-b:a', '192k',
                    '-movflags', '+faststart',
                    '-y', // Overwrite output file
                    'output.mp4'
                ]);
                this.updateProgress(90, 'Finalizing conversion...');
            }

            // Read the converted file
            const outputData = await this.ffmpeg.readFile('output.mp4');
            this.convertedBlob = new Blob([outputData.buffer], { type: 'video/mp4' });

            // Clean up FFmpeg file system
            try {
                await this.ffmpeg.deleteFile('input.mov');
                await this.ffmpeg.deleteFile('output.mp4');
            } catch (cleanupError) {
                console.log('Cleanup warning:', cleanupError);
            }

            this.updateProgress(100, 'Conversion completed!');
            setTimeout(() => {
                this.hideConversion();
                this.showDownload();
            }, 500);

        } catch (error) {
            console.error('Conversion failed:', error);
            this.hideConversion();
            this.showError('Conversion failed. Please try again or use a different file.');
        }
    }

    downloadFile() {
        if (!this.convertedBlob) return;

        // Create download link
        const url = URL.createObjectURL(this.convertedBlob);
        const a = document.createElement('a');
        a.href = url;
        
        // Generate filename
        const originalName = this.selectedFile.name.replace(/\.[^/.]+$/, '');
        a.download = `${originalName}_converted.mp4`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        URL.revokeObjectURL(url);
    }

    updateProgress(percentage, message) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${percentage}%`;
        this.statusMessage.textContent = message;
    }

    updateStatus(message) {
        if (this.statusMessage) {
            this.statusMessage.textContent = message;
        }
    }

    showConversion() {
        this.conversionStatus.style.display = 'block';
        this.convertButton.disabled = true;
        this.hideError();
        this.hideDownload();
    }

    hideConversion() {
        this.conversionStatus.style.display = 'none';
        this.convertButton.disabled = false;
    }

    showDownload() {
        this.downloadSection.style.display = 'block';
    }

    hideDownload() {
        this.downloadSection.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
        this.hideConversion();
        this.hideDownload();
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }

    resetConverter() {
        this.clearFile();
        this.hideError();
        this.hideConversion();
        this.hideDownload();
        this.convertedBlob = null;
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MOVConverter();
});
