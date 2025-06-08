/**
 * Article Translator Application
 * Translates design articles into multiple Indian languages using Sarvam AI API
 */
class ArticleTranslator {
    constructor() {
        this.apiKey = '';
        this.currentContent = '';
        this.currentLanguage = 'hi-IN';
        this.isTranslating = false;
        
        // Cache DOM elements
        this.elements = {};
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSavedApiKey();
        this.setupAccessibility();
        this.initializeUI();
    }

    initializeUI() {
        // Set initial state - show URL input by default
        this.elements.urlInputSection.style.display = 'block';
        this.elements.textInputSection.style.display = 'none';
        this.elements.inputMethodToggle.setAttribute('aria-checked', 'true');
        this.elements.inputMethodToggle.textContent = '📝 Switch to Manual Text';
        
        // Disable translate button initially
        this.elements.translateBtn.disabled = true;
        
        // Set initial API key status
        if (!this.apiKey) {
            this.updateApiKeyStatus(false, 'Please enter and save your API key');
        }
    }

    cacheElements() {
        this.elements = {
            // API Key elements
            apiKeyInput: document.getElementById('apiKey'),
            saveApiKeyBtn: document.getElementById('saveApiKey'),
            apiKeyStatus: document.getElementById('apiKeyStatus'),
            
            // Input method toggle elements
            urlToggleBtn: document.getElementById('urlToggleBtn'),
            textToggleBtn: document.getElementById('textToggleBtn'),
            urlInputSection: document.getElementById('urlInputSection'),
            textInputSection: document.getElementById('textInputSection'),
            
            // URL input elements
            urlInput: document.getElementById('urlInput'),
            fetchBtn: document.getElementById('fetchBtn'),
            
            // Text input elements
            textInput: document.getElementById('textInput'),
            
            // Translation elements
            languageSelect: document.getElementById('languageSelect'),
            translateBtn: document.getElementById('translateBtn'),
            
            // Results elements
            originalContent: document.getElementById('originalContent'),
            translatedContent: document.getElementById('translatedContent'),
            
            // Status elements
            loadingIndicator: document.getElementById('loadingIndicator'),
            errorMessage: document.getElementById('errorMessage'),
            
            // ARIA live regions
            statusAnnouncement: document.getElementById('statusAnnouncement')
        };
    }

    bindEvents() {
        // API Key events
        if (this.elements.saveApiKeyBtn) {
            this.elements.saveApiKeyBtn.addEventListener('click', () => this.handleSaveApiKey());
        }
        
        // Input method toggle events
        if (this.elements.urlToggleBtn) {
            this.elements.urlToggleBtn.addEventListener('click', () => this.handleInputMethodChange('url'));
            this.elements.urlToggleBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleInputMethodChange('url');
                }
            });
        }
        
        if (this.elements.textToggleBtn) {
            this.elements.textToggleBtn.addEventListener('click', () => this.handleInputMethodChange('text'));
            this.elements.textToggleBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleInputMethodChange('text');
                }
            });
        }
        
        // URL input events
        if (this.elements.fetchBtn) {
            this.elements.fetchBtn.addEventListener('click', () => this.handleFetchArticle());
        }
        
        // Text input events
        if (this.elements.textInput) {
            this.elements.textInput.addEventListener('input', () => this.handleTextInput());
        }
        
        // Translation events
        if (this.elements.languageSelect) {
            this.elements.languageSelect.addEventListener('change', () => this.enableTranslateButton());
        }
        
        if (this.elements.translateBtn) {
            this.elements.translateBtn.addEventListener('click', () => this.handleTranslate());
        }
    }

    setupAccessibility() {
        // Set up ARIA attributes for input method toggle
        if (this.elements.urlToggleBtn) {
            this.elements.urlToggleBtn.setAttribute('role', 'tab');
            this.elements.urlToggleBtn.setAttribute('aria-selected', 'true');
        }
        
        if (this.elements.textToggleBtn) {
            this.elements.textToggleBtn.setAttribute('role', 'tab');
            this.elements.textToggleBtn.setAttribute('aria-selected', 'false');
        }
        
        // Set up live regions for status updates
        if (!this.elements.statusAnnouncement) {
            const announcer = document.createElement('div');
            announcer.id = 'statusAnnouncement';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.position = 'absolute';
            announcer.style.left = '-10000px';
            announcer.style.width = '1px';
            announcer.style.height = '1px';
            announcer.style.overflow = 'hidden';
            document.body.appendChild(announcer);
            this.elements.statusAnnouncement = announcer;
        }
        
        // Set up form labels and descriptions
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label) {
                    input.setAttribute('aria-labelledby', label.id || `${input.id}-label`);
                }
            }
        });
    }

    loadSavedApiKey() {
        const savedApiKey = localStorage.getItem('sarvamApiKey');
        if (savedApiKey) {
            this.apiKey = savedApiKey;
            this.elements.apiKeyInput.value = savedApiKey;
            this.updateApiKeyStatus(true);
        }
    }

    handleSaveApiKey() {
        const apiKey = this.elements.apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.updateApiKeyStatus(false, 'Please enter an API key');
            return;
        }

        if (!this.validateApiKey(apiKey)) {
            this.updateApiKeyStatus(false, 'Invalid API key format');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('sarvamApiKey', apiKey);
        this.updateApiKeyStatus(true, 'API key saved successfully');
        this.announceStatus('API key saved successfully');
    }

    validateApiKey(apiKey) {
        // Basic validation - adjust based on Sarvam AI API key format
        return apiKey.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(apiKey);
    }

    updateApiKeyStatus(isValid, message = '') {
        const status = this.elements.apiKeyStatus;
        if (isValid) {
            status.textContent = message || '✓ API Key saved';
            status.className = 'status-success';
        } else {
            status.textContent = message || '✗ API Key required';
            status.className = 'status-error';
        }
        status.style.display = 'block';
    }

    handleInputMethodChange(method) {
        const isUrlMethod = method === 'url';
        
        // Update button states
        if (this.elements.urlToggleBtn) {
            this.elements.urlToggleBtn.classList.toggle('active', isUrlMethod);
            this.elements.urlToggleBtn.setAttribute('aria-selected', isUrlMethod.toString());
        }
        
        if (this.elements.textToggleBtn) {
            this.elements.textToggleBtn.classList.toggle('active', !isUrlMethod);
            this.elements.textToggleBtn.setAttribute('aria-selected', (!isUrlMethod).toString());
        }
        
        // Toggle input sections
        if (this.elements.urlInputSection) {
            this.elements.urlInputSection.style.display = isUrlMethod ? 'block' : 'none';
        }
        
        if (this.elements.textInputSection) {
            this.elements.textInputSection.style.display = isUrlMethod ? 'none' : 'block';
        }
        
        // Clear previous content when switching
        if (this.elements.articleContent) {
            this.elements.articleContent.innerHTML = '';
        }
        
        if (this.elements.translationResult) {
            this.elements.translationResult.innerHTML = '';
        }
        
        // Announce the change
        const methodName = isUrlMethod ? 'URL' : 'Manual Text';
        this.announceStatus(`Switched to ${methodName} input method`);
    }

    async handleFetchArticle() {
        const url = this.elements.urlInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a URL');
            return;
        }

        if (!this.validateUrl(url)) {
            this.showError('Please enter a valid URL');
            return;
        }

        this.showLoading(true, 'Fetching article...');
        this.elements.fetchBtn.disabled = true;
        this.elements.fetchBtn.textContent = '🔄 Fetching...';

        try {
            const content = await this.fetchArticleContent(url);
            
            if (content) {
                this.currentContent = content;
                this.displayOriginalContent(content);
                this.enableTranslateButton();
                this.announceStatus('Article fetched successfully');
            } else {
                this.showError('Failed to fetch article content');
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            this.showError('Failed to fetch article: ' + error.message);
        } finally {
            this.showLoading(false);
            this.elements.fetchBtn.disabled = false;
            this.elements.fetchBtn.textContent = '📰 Fetch Article';
        }
    }

    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    async fetchArticleContent(url) {
        // Try multiple CORS proxies for better reliability
        const proxies = [
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
            `https://cors-anywhere.herokuapp.com/${url}`,
            `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
        ];
        
        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (!response.ok) {
                    continue; // Try next proxy
                }
                
                let html;
                if (proxyUrl.includes('allorigins')) {
                    const data = await response.json();
                    html = data.contents;
                } else {
                    html = await response.text();
                }
                
                return this.extractTextContent(html);
            } catch (error) {
                console.warn(`Proxy ${proxyUrl} failed:`, error);
                continue; // Try next proxy
            }
        }
        
        throw new Error('All CORS proxies failed. Please try a different URL or check your internet connection.');
    }

    extractTextContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove script and style elements
        const scripts = doc.querySelectorAll('script, style, nav, header, footer, aside, .sidebar, .navigation, .menu');
        scripts.forEach(el => el.remove());
        
        // Extract text from common article containers
        const selectors = [
            'article',
            '[role="main"]',
            '.content',
            '.article-content',
            '.post-content',
            '.entry-content',
            '.article-body',
            '.post-body',
            'main .content',
            '.main-content'
        ];
        
        for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element && element.textContent.trim().length > 200) {
                return this.cleanText(element.textContent.trim());
            }
        }
        
        // Fallback to body text, but filter out navigation and other non-content
        const bodyText = doc.body.textContent.trim();
        return this.cleanText(bodyText);
    }
    
    cleanText(text) {
        // Remove extra whitespace and clean up the text
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
    }

    handleTextInput() {
        const text = this.elements.textInput.value.trim();
        
        if (text) {
            this.currentContent = text;
            this.displayOriginalContent(text);
            this.enableTranslateButton();
            this.announceStatus('Text content updated');
        } else {
            this.currentContent = '';
            this.displayOriginalContent('');
            this.elements.translateBtn.disabled = true;
        }
    }

    displayOriginalContent(content) {
        if (this.elements.originalContent) {
            if (content) {
                this.elements.originalContent.innerHTML = `<div class="article-content">${this.escapeHtml(content)}</div>`;
            } else {
                this.elements.originalContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📄</div>
                        <div class="empty-state-text">No content loaded</div>
                        <div class="empty-state-subtext">Fetch an article from URL or paste text to get started</div>
                    </div>
                `;
            }
        }
    }

    enableTranslateButton() {
        const hasContent = this.currentContent && this.currentContent.trim().length > 0;
        const hasLanguage = this.elements.languageSelect.value;
        const shouldEnable = hasContent && hasLanguage;
        
        this.elements.translateBtn.disabled = !shouldEnable;
        
        if (shouldEnable) {
            const selectedValue = this.elements.languageSelect.value;
            const isTransliteration = selectedValue.startsWith('transliterate-');
            this.elements.translateBtn.textContent = isTransliteration ? '🔤 Transliterate' : '🌐 Translate';
        } else {
            this.elements.translateBtn.textContent = '🌐 Translate';
        }
    }

    async handleTranslate() {
        if (!this.currentContent) {
            this.showError('Please load content first');
            return;
        }

        if (!this.elements.languageSelect.value) {
            this.showError('Please select a target language');
            return;
        }

        if (!this.apiKey) {
            this.showError('Please save your API key first');
            return;
        }

        if (this.isTranslating) {
            return;
        }

        this.isTranslating = true;
        
        const selectedValue = this.elements.languageSelect.value;
        const isTransliteration = selectedValue.startsWith('transliterate-');
        
        this.showLoading(true, isTransliteration ? 'Transliterating text...' : 'Translating text...');
        this.elements.translateBtn.disabled = true;

        try {
            let result;
            if (isTransliteration) {
                result = await this.transliterateText(this.currentContent, selectedValue);
            } else {
                result = await this.translateText(this.currentContent, selectedValue);
            }
            this.displayTranslatedContent(result);
            this.announceStatus(isTransliteration ? 'Transliteration completed successfully' : 'Translation completed successfully');
        } catch (error) {
            console.error('Translation/Transliteration error:', error);
            this.showError(isTransliteration ? 'Transliteration failed. Please try again.' : 'Translation failed. Please try again.');
        } finally {
            this.isTranslating = false;
            this.showLoading(false);
            this.elements.translateBtn.disabled = false;
            this.elements.translateBtn.textContent = isTransliteration ? '🔤 Transliterate' : '🌐 Translate';
        }
    }

    async translateText(text, targetLanguage) {
        const chunks = this.chunkText(text, 1000); // Split into smaller chunks
        const translatedChunks = [];

        for (const chunk of chunks) {
            const translatedChunk = await this.translateChunk(chunk, targetLanguage);
            translatedChunks.push(translatedChunk);
        }

        return translatedChunks.join(' ');
    }

    chunkText(text, maxLength) {
        const chunks = [];
        const sentences = text.split(/[.!?]+/);
        let currentChunk = '';

        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > maxLength && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence + '.';
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    async translateChunk(text, targetLanguage) {
        const response = await fetch('https://api.sarvam.ai/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'API-Subscription-Key': this.apiKey
            },
            body: JSON.stringify({
                input: text,
                source_language_code: 'en-IN',
                target_language_code: targetLanguage,
                speaker_gender: 'Male',
                mode: 'formal',
                model: 'sarvam-translate:v1',
                enable_preprocessing: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.translated_text || text;
    }

    async transliterateText(text, targetLanguage) {
        try {
            console.log('Starting transliteration:', { targetLanguage, textLength: text.length });
            
            // Extract language code from transliterate-xx format
            const langCode = targetLanguage.replace('transliterate-', '');
            console.log('Extracted language code:', langCode);
            
            const chunks = this.chunkText(text, 1000);
            console.log('Text chunks:', chunks.length);
            
            const transliteratedChunks = [];

            for (let i = 0; i < chunks.length; i++) {
                console.log(`Processing chunk ${i + 1}/${chunks.length}`);
                try {
                    const transliteratedChunk = await this.transliterateChunk(chunks[i], langCode);
                    transliteratedChunks.push(transliteratedChunk);
                } catch (chunkError) {
                    console.error(`Error in chunk ${i + 1}:`, chunkError);
                    // If individual chunk fails, try a different approach
                    const fallbackResult = await this.fallbackTransliteration(chunks[i], langCode);
                    transliteratedChunks.push(fallbackResult);
                }
            }

            const result = transliteratedChunks.join(' ');
            console.log('Transliteration completed, result length:', result.length);
            return result;
            
        } catch (error) {
            console.error('Transliteration failed:', error);
            throw error;
        }
    }

    async transliterateChunk(text, targetLanguage) {
        // Debug logging
        console.log('Transliterating:', { text: text.substring(0, 50), targetLanguage });
        
        const response = await fetch('https://api.sarvam.ai/transliterate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': this.apiKey
            },
            body: JSON.stringify({
                input: text,
                source_language_code: 'en-IN',
                target_language_code: `${targetLanguage}-IN`
            })
        });

        console.log('Transliteration response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Transliteration API error:', errorText);
            throw new Error(`Transliteration API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Transliteration response:', data);
        
        return data.transliterated_text || text;
    }

    async fallbackTransliteration(text, targetLanguage) {
        console.log('Trying fallback transliteration method');
        
        // Use the correct transliterate endpoint as fallback too
        const response = await fetch('https://api.sarvam.ai/transliterate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': this.apiKey
            },
            body: JSON.stringify({
                input: text,
                source_language_code: 'en-IN',
                target_language_code: `${targetLanguage}-IN`
            })
        });

        if (!response.ok) {
            console.error('Fallback transliteration failed:', response.status);
            return text; // Return original text if all methods fail
        }

        const data = await response.json();
        return data.transliterated_text || text;
    }

    async performTransliteration(text, targetLanguage) {
        // This method is no longer needed as we're using the correct API directly
        return this.transliterateChunk(text, targetLanguage);
    }

    displayTranslatedContent(content) {
        if (this.elements.translatedContent) {
            this.elements.translatedContent.innerHTML = `<div class="article-content">${this.escapeHtml(content)}</div>`;
        }
    }

    showLoading(show, text = 'Processing...') {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = show ? 'flex' : 'none';
            
            // Update loading text if provided
            const loadingText = this.elements.loadingIndicator.querySelector('.loading-text');
            if (loadingText && text) {
                loadingText.textContent = text;
            }
        }
    }

    showError(message) {
        // Create or update error display
        let errorDiv = document.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message status-error';
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '20px';
            errorDiv.style.right = '20px';
            errorDiv.style.zIndex = '1001';
            errorDiv.style.maxWidth = '300px';
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
        
        this.announceStatus(`Error: ${message}`);
    }

    clearError() {
        this.elements.errorMessage.style.display = 'none';
        this.elements.errorMessage.textContent = '';
    }

    announceStatus(message) {
        if (this.elements.statusAnnouncement) {
            this.elements.statusAnnouncement.textContent = message;
        }
    }

    // Utility method to escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
const translator = new ArticleTranslator();

// Global functions for backward compatibility (if needed)
window.translator = translator; 
window.translator = translator; 
