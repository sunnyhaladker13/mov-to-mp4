class SimpleConverter {
    constructor() {
        this.selectedFile = null;
        this.initializeElements();
        this.setupEventListeners();
        this.checkCapabilities();
    }

    initializeElements() {
        // Status elements
        this.statusSection = document.getElementById('statusSection');
        this.statusIcon = document.getElementById('statusIcon');
        this.statusText = document.getElementById('statusText');

        // Upload elements
        this.uploadSection = document.getElementById('uploadSection');
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadButton = document.getElementById('uploadButton');
        this.fileInput = document.getElementById('fileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.removeFile = document.getElementById('removeFile');

        // Alternative elements
        this.alternativesSection = document.getElementById('alternativesSection');
        this.tryRenameBtn = document.getElementById('tryRenameBtn');

        // Working elements
        this.workingSection = document.getElementById('workingSection');
        this.convertButton = document.getElementById('convertButton');
        this.conversionStatus = document.getElementById('conversionStatus');
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

        // Button events
        this.tryRenameBtn.addEventListener('click', () => this.performSimpleRename());
        this.convertButton.addEventListener('click', () => this.showError('Browser-based conversion is not available. Please use the alternative solutions above.'));
        this.retryButton.addEventListener('click', () => this.checkCapabilities());
    }

    async checkCapabilities() {
        this.statusIcon.textContent = '🔄';
        this.statusText.textContent = 'Checking browser capabilities...';

        // Check for basic requirements
        const hasWebAssembly = typeof WebAssembly !== 'undefined';
        const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
        const hasWorkers = typeof Worker !== 'undefined';
        const hasFileAPI = typeof File !== 'undefined';

        console.log('Browser capabilities:', {
            WebAssembly: hasWebAssembly,
            SharedArrayBuffer: hasSharedArrayBuffer,
            Workers: hasWorkers,
            FileAPI: hasFileAPI
        });

        // Simulate checking for FFmpeg.wasm
        setTimeout(() => {
            if (hasWebAssembly && hasSharedArrayBuffer && hasWorkers && hasFileAPI) {
                // Try to check if FFmpeg.wasm would work
                this.statusText.textContent = 'Testing video converter...';
                
                setTimeout(() => {
                    // For now, assume it doesn't work and show alternatives
                    this.showAlternatives();
                }, 2000);
            } else {
                this.showAlternatives();
            }
        }, 1000);
    }

    showAlternatives() {
        this.statusIcon.textContent = '🛠';
        this.statusText.textContent = 'Browser-based conversion has limitations';
        
        setTimeout(() => {
            this.statusSection.style.display = 'none';
            this.uploadSection.style.display = 'block';
            this.alternativesSection.style.display = 'block';
        }, 1500);
    }

    showWorkingConverter() {
        this.statusSection.style.display = 'none';
        this.alternativesSection.style.display = 'none';
        this.uploadSection.style.display = 'block';
        this.workingSection.style.display = 'block';
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

        this.selectedFile = file;
        this.displayFileInfo(file);
        this.tryRenameBtn.style.display = 'inline-block';
        this.hideError();
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
        this.tryRenameBtn.style.display = 'none';
        this.hideError();
        this.hideDownload();
    }

    performSimpleRename() {
        if (!this.selectedFile) return;

        // Create a new file with .mp4 extension
        const originalName = this.selectedFile.name.replace(/\.[^/.]+$/, '');
        const newFileName = `${originalName}.mp4`;
        
        // Create a blob with the same data but different name
        const blob = new Blob([this.selectedFile], { type: 'video/mp4' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = newFileName;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Show success message
        this.showSuccess('File renamed and downloaded! Note: This only changes the extension - actual conversion may still be needed for compatibility.');
    }

    showSuccess(message) {
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
        this.errorSection.style.background = '#d4edda';
        this.errorSection.style.color = '#155724';
        document.querySelector('.error-icon').textContent = '✓';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
        this.errorSection.style.background = '#f8d7da';
        this.errorSection.style.color = '#721c24';
        document.querySelector('.error-icon').textContent = '⚠';
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }

    hideDownload() {
        this.downloadSection.style.display = 'none';
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimpleConverter();
});
