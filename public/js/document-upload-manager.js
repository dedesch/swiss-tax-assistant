// Document Upload Manager
class DocumentUploadManager {
    constructor() {
        this.currentExtractionResults = null;
        this.processingHistory = JSON.parse(localStorage.getItem('document_processing_history') || '[]');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File input change handler
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            // Remove existing listeners to avoid duplicates
            fileInput.removeEventListener('change', this.fileInputHandler);
            this.fileInputHandler = (e) => this.handleFileSelection(e.target.files);
            fileInput.addEventListener('change', this.fileInputHandler);
        }

        // Drag and drop handlers
        const dropzone = document.getElementById('uploadDropzone');
        if (dropzone) {
            // Remove existing listeners to avoid duplicates
            dropzone.removeEventListener('dragover', this.dragOverHandler);
            dropzone.removeEventListener('dragleave', this.dragLeaveHandler);
            dropzone.removeEventListener('drop', this.dropHandler);
            dropzone.removeEventListener('click', this.clickHandler);
            
            // Bind handlers to this instance for proper cleanup
            this.dragOverHandler = this.handleDragOver.bind(this);
            this.dragLeaveHandler = this.handleDragLeave.bind(this);
            this.dropHandler = this.handleDrop.bind(this);
            this.clickHandler = () => fileInput?.click();
            
            dropzone.addEventListener('dragover', this.dragOverHandler);
            dropzone.addEventListener('dragleave', this.dragLeaveHandler);
            dropzone.addEventListener('drop', this.dropHandler);
            dropzone.addEventListener('click', this.clickHandler);
        }
    }

    // Initialize upload interface when tab loads
    initializeUploadInterface() {
        // Re-initialize event listeners after DOM content loads
        this.initializeEventListeners();
        this.displayProcessingHistory();
        this.resetInterface();
    }

    // Drag and drop handlers
    handleDragOver(e) {
        e.preventDefault();
        const dropzone = document.getElementById('uploadDropzone');
        dropzone.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        const dropzone = document.getElementById('uploadDropzone');
        dropzone.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        const dropzone = document.getElementById('uploadDropzone');
        dropzone.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.handleFileSelection(files);
    }

    // Handle file selection (from input or drag-drop)
    async handleFileSelection(files) {
        if (!files || files.length === 0) return;

        // Validate files
        const validFiles = Array.from(files).filter(file => this.validateFile(file));
        if (validFiles.length === 0) {
            showNotification('No valid files selected. Please choose image or PDF files under 10MB.', 'warning');
            return;
        }

        // Show upload queue
        this.displayUploadQueue(validFiles);

        // Process files one by one
        for (let i = 0; i < validFiles.length; i++) {
            await this.processDocument(validFiles[i], i);
        }
    }

    // Validate file type and size
    validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            // Special message for PDFs
            if (file.type === 'application/pdf') {
                showNotification(`PDF not supported: ${this.sanitizeFileName(file.name)}. Please upload a screenshot of your PDF instead.`, 'warning');
            } else {
                showNotification(`Invalid file type: ${this.sanitizeFileName(file.name)}. Only images are allowed.`, 'error');
            }
            return false;
        }

        if (file.size > maxSize) {
            showNotification(`File too large: ${this.sanitizeFileName(file.name)}. Maximum size is 10MB.`, 'error');
            return false;
        }

        return true;
    }

    // Display upload queue
    displayUploadQueue(files) {
        const queueContainer = document.getElementById('uploadQueue');
        const queueList = document.getElementById('queueList');
        
        if (!queueContainer || !queueList) return;

        queueContainer.style.display = 'block';
        queueList.innerHTML = '';

        files.forEach((file, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = 'queue-item';
            queueItem.id = `queue-item-${index}`;
            
            // Create elements safely to prevent XSS
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            
            const fileIcon = document.createElement('div');
            fileIcon.className = 'file-icon';
            fileIcon.textContent = this.getFileIcon(file.type);
            
            const fileDetails = document.createElement('div');
            fileDetails.className = 'file-details';
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name; // Use textContent to prevent XSS
            
            const fileSize = document.createElement('div');
            fileSize.className = 'file-size';
            fileSize.textContent = this.formatFileSize(file.size);
            
            const status = document.createElement('div');
            status.className = 'status processing';
            status.id = `status-${index}`;
            status.textContent = 'Queued';
            
            fileDetails.appendChild(fileName);
            fileDetails.appendChild(fileSize);
            fileInfo.appendChild(fileIcon);
            fileInfo.appendChild(fileDetails);
            queueItem.appendChild(fileInfo);
            queueItem.appendChild(status);
            
            queueList.appendChild(queueItem);
        });
    }

    // Process a single document
    async processDocument(file, index) {
        try {
            // Update status to processing
            this.updateQueueItemStatus(index, 'processing', 'Processing...');
            this.showProcessingStatus(true);

            // Check authentication
            if (!api.isAuthenticated()) {
                throw new Error('Please log in to upload documents');
            }

            // Create form data
            const formData = new FormData();
            formData.append('document', file);

            // Upload and process
            const response = await fetch('/api/document-upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Update status to completed
                this.updateQueueItemStatus(index, 'completed', 'Completed');
                
                // Store results and show them
                this.currentExtractionResults = result.data;
                this.displayExtractionResults(result.data);
                
                // Add to history
                this.addToProcessingHistory(file.name, result.data);
                
                showNotification(`Document processed successfully: ${file.name}`, 'success');
            } else {
                throw new Error(result.error || 'Processing failed');
            }

        } catch (error) {
            console.error('Document processing error:', error);
            this.updateQueueItemStatus(index, 'error', error.message);
            showNotification(`Failed to process ${file.name}: ${error.message}`, 'error');
        } finally {
            this.showProcessingStatus(false);
        }
    }

    // Update queue item status
    updateQueueItemStatus(index, status, text) {
        const statusElement = document.getElementById(`status-${index}`);
        if (statusElement) {
            statusElement.className = `status ${status}`;
            statusElement.textContent = text;
        }
    }

    // Show/hide processing status
    showProcessingStatus(show) {
        const processingStatus = document.getElementById('processingStatus');
        if (processingStatus) {
            processingStatus.style.display = show ? 'block' : 'none';
        }
    }

    // Display extraction results
    displayExtractionResults(data) {
        const resultsContainer = document.getElementById('extractionResults');
        if (!resultsContainer) return;

        resultsContainer.style.display = 'block';

        // Display document info
        this.displayDocumentInfo(data.documentType);
        
        // Display extracted data
        this.displayExtractedData(data.extractedData);
        
        // Enable action buttons
        const applyBtn = document.getElementById('applyBtn');
        const reviewBtn = document.getElementById('reviewBtn');
        if (applyBtn) applyBtn.disabled = false;
        if (reviewBtn) reviewBtn.disabled = false;
    }

    // Display document type and confidence
    displayDocumentInfo(documentType) {
        const documentInfo = document.getElementById('documentInfo');
        if (!documentInfo) return;

        const confidence = documentType.confidence || 0;
        const confidencePercent = Math.round(confidence * 100);
        
        documentInfo.innerHTML = `
            <h5>📋 Document Analysis</h5>
            <div style="margin: 15px 0;">
                <strong>Document Type:</strong> ${this.formatDocumentType(documentType.document_type)}
            </div>
            <div style="margin: 15px 0;">
                <strong>Confidence:</strong> ${confidencePercent}%
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
                </div>
            </div>
            <div style="margin: 15px 0;">
                <strong>Language:</strong> ${documentType.language || 'Not detected'}
            </div>
        `;
    }

    // Display extracted data
    displayExtractedData(extractedData) {
        const extractedDataContainer = document.getElementById('extractedData');
        const fieldMappingContainer = document.getElementById('fieldMapping');
        const suggestionsContainer = document.getElementById('suggestions');
        
        if (!extractedDataContainer) return;

        // Display raw extracted data
        extractedDataContainer.innerHTML = '<h5>📊 Extracted Information</h5>';
        
        if (extractedData.extractedData) {
            const fieldGroups = this.groupExtractedFields(extractedData.extractedData);
            Object.keys(fieldGroups).forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'field-group';
                groupDiv.innerHTML = `<h5>${group}</h5>`;
                
                fieldGroups[group].forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        const fieldDiv = document.createElement('div');
                        fieldDiv.className = 'extracted-field';
                        fieldDiv.innerHTML = `
                            <span class="field-label">${this.formatFieldLabel(key)}:</span>
                            <span class="field-value">${this.formatFieldValue(value)}</span>
                        `;
                        groupDiv.appendChild(fieldDiv);
                    }
                });
                
                extractedDataContainer.appendChild(groupDiv);
            });
        }

        // Display tax form field mapping
        if (fieldMappingContainer && extractedData.taxFormFields) {
            this.displayFieldMapping(extractedData.taxFormFields, fieldMappingContainer);
        }

        // Display suggestions
        if (suggestionsContainer && extractedData.suggestions) {
            this.displaySuggestions(extractedData.suggestions, suggestionsContainer);
        }
    }

    // Display field mapping to tax forms
    displayFieldMapping(taxFormFields, container) {
        container.innerHTML = '<h5>🔄 Tax Form Mapping</h5>';
        
        Object.keys(taxFormFields).forEach(taxField => {
            if (taxFormFields[taxField] !== null && taxFormFields[taxField] !== undefined) {
                const mappingDiv = document.createElement('div');
                mappingDiv.className = 'mapping-item';
                mappingDiv.innerHTML = `
                    <span>${this.formatFieldLabel(taxField)}</span>
                    <span class="mapping-arrow">→</span>
                    <span class="field-value">${this.formatFieldValue(taxFormFields[taxField])}</span>
                `;
                container.appendChild(mappingDiv);
            }
        });

        if (Object.keys(taxFormFields).length === 0) {
            container.innerHTML += '<p class="text-muted">No direct field mappings available for this document type.</p>';
        }
    }

    // Display AI suggestions
    displaySuggestions(suggestions, container) {
        container.innerHTML = '<h5>💡 AI Suggestions</h5>';
        
        if (suggestions.length === 0) {
            container.innerHTML += '<p class="text-muted">No specific suggestions for this document.</p>';
            return;
        }

        suggestions.forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'suggestion-item';
            suggestionDiv.innerHTML = `
                <div class="suggestion-icon">💡</div>
                <div>${suggestion}</div>
            `;
            container.appendChild(suggestionDiv);
        });
    }

    // Group extracted fields by category
    groupExtractedFields(data) {
        const groups = {
            'Personal Information': [],
            'Financial Information': [],
            'Other Information': []
        };

        Object.entries(data).forEach(([key, value]) => {
            if (key.includes('name') || key.includes('holder') || key.includes('employee')) {
                groups['Personal Information'].push([key, value]);
            } else if (key.includes('salary') || key.includes('income') || key.includes('balance') || 
                      key.includes('premium') || key.includes('interest') || key.includes('dividend') ||
                      key.includes('amount') || key.includes('payment') || key.includes('deduction')) {
                groups['Financial Information'].push([key, value]);
            } else {
                groups['Other Information'].push([key, value]);
            }
        });

        return groups;
    }

    // Format document type for display
    formatDocumentType(type) {
        const types = {
            'salary_statement': 'Salary Statement / Pay Slip',
            'bank_statement': 'Bank Statement',
            'insurance_document': 'Insurance Document',
            'mortgage_statement': 'Mortgage Statement',
            'investment_statement': 'Investment Statement',
            'property_document': 'Property Document',
            'other': 'Other Document'
        };
        return types[type] || type;
    }

    // Format field labels for display
    formatFieldLabel(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Format field values for display
    formatFieldValue(value) {
        if (typeof value === 'number') {
            // Format currency values
            if (value > 100 || value.toString().includes('.')) {
                return new Intl.NumberFormat('de-CH', {
                    style: 'currency',
                    currency: 'CHF'
                }).format(value);
            }
        }
        return value.toString();
    }

    // Get file icon based on type
    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType === 'application/pdf') return '📄';
        return '📎';
    }

    // Format file size for display
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Add to processing history
    addToProcessingHistory(filename, data) {
        const historyItem = {
            id: Date.now(),
            filename: filename,
            documentType: data.documentType,
            processedAt: new Date().toISOString(),
            extractedFields: Object.keys(data.extractedData.taxFormFields || {}).length
        };

        this.processingHistory.unshift(historyItem);
        
        // Keep only last 10 items
        this.processingHistory = this.processingHistory.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('document_processing_history', JSON.stringify(this.processingHistory));
        
        // Update display
        this.displayProcessingHistory();
    }

    // Display processing history
    displayProcessingHistory() {
        const historyContainer = document.getElementById('processingHistory');
        if (!historyContainer) return;

        if (this.processingHistory.length === 0) {
            historyContainer.innerHTML = '<p class="text-muted">No documents processed yet. Upload your first document above!</p>';
            return;
        }

        historyContainer.innerHTML = '';
        this.processingHistory.forEach(item => {
            const historyDiv = document.createElement('div');
            historyDiv.className = 'history-item';
            historyDiv.innerHTML = `
                <div class="history-info">
                    <div class="history-filename">${item.filename}</div>
                    <div class="history-details">
                        ${this.formatDocumentType(item.documentType.document_type)} • 
                        ${item.extractedFields} fields • 
                        ${new Date(item.processedAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="history-actions">
                    <button class="btn btn-small btn-secondary" onclick="documentUploadManager.viewHistoryItem('${item.id}')">
                        View
                    </button>
                </div>
            `;
            historyContainer.appendChild(historyDiv);
        });
    }

    // View history item (placeholder - could expand to show details)
    viewHistoryItem(id) {
        const item = this.processingHistory.find(h => h.id.toString() === id);
        if (item) {
            showNotification(`Viewing: ${item.filename}`, 'info');
            // Could expand this to show full details or re-apply data
        }
    }

    // Reset interface
    resetInterface() {
        const containers = ['uploadQueue', 'extractionResults', 'processingStatus'];
        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });

        // Reset file input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';

        // Disable buttons
        const buttons = ['applyBtn', 'reviewBtn'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });

        this.currentExtractionResults = null;
    }
}

// Global functions for HTML onclick handlers
function applyExtractedData() {
    if (window.documentUploadManager && window.documentUploadManager.currentExtractionResults) {
        window.documentUploadManager.applyDataToForms();
    }
}

function reviewData() {
    if (window.documentUploadManager && window.documentUploadManager.currentExtractionResults) {
        window.documentUploadManager.showReviewModal();
    }
}

function clearResults() {
    if (window.documentUploadManager) {
        window.documentUploadManager.resetInterface();
        showNotification('Results cleared', 'info');
    }
}

// Apply extracted data to tax forms
DocumentUploadManager.prototype.applyDataToForms = function() {
    if (!this.currentExtractionResults || !this.currentExtractionResults.extractedData.taxFormFields) {
        showNotification('No data to apply', 'warning');
        return;
    }

    const taxFormFields = this.currentExtractionResults.extractedData.taxFormFields;
    let appliedCount = 0;

    // Apply each mapped field
    Object.keys(taxFormFields).forEach(fieldId => {
        const value = taxFormFields[fieldId];
        if (value !== null && value !== undefined) {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value;
                element.style.backgroundColor = '#d4edda'; // Highlight applied fields
                appliedCount++;
                
                // Trigger change event to update calculations
                element.dispatchEvent(new Event('change'));
            }
        }
    });

    if (appliedCount > 0) {
        showNotification(`Applied ${appliedCount} fields to your tax forms`, 'success');
        
        // Update calculations
        if (window.calculationEngine) {
            window.calculationEngine.calculateTotals();
        }
        
        // Clear highlights after 3 seconds
        setTimeout(() => {
            Object.keys(taxFormFields).forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element) element.style.backgroundColor = '';
            });
        }, 3000);
    } else {
        showNotification('No matching form fields found to apply data', 'warning');
    }
};

// Show review modal (placeholder for future enhancement)
DocumentUploadManager.prototype.showReviewModal = function() {
    showNotification('Review modal - feature coming soon!', 'info');
    // Could implement a modal to let users review and edit extracted data before applying
};

// Add sanitizeFileName method to the prototype
DocumentUploadManager.prototype.sanitizeFileName = function(fileName) {
    // Remove HTML tags and limit length
    return fileName.replace(/<[^>]*>/g, '').substring(0, 100);
};

// Initialize global instance
window.documentUploadManager = new DocumentUploadManager();