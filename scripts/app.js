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
        
        // Remove unwanted elements more comprehensively
        const unwantedSelectors = [
            'script', 'style', 'noscript', 'iframe', 'embed', 'object',
            'header', 'footer', 'nav', 'aside', 
            '.header', '.footer', '.navigation', '.nav', '.sidebar', '.menu',
            '.social-share', '.social-sharing', '.share-buttons',
            '.advertisement', '.ads', '.ad', '.banner',
            '.comments', '.comment-section', '.disqus',
            '.related-posts', '.related-articles', '.recommendations',
            '.newsletter', '.subscription', '.signup',
            '.breadcrumb', '.breadcrumbs',
            '.author-bio', '.author-info',
            '.tags', '.categories', '.metadata',
            '.popup', '.modal', '.overlay',
            '[role="banner"]', '[role="navigation"]', '[role="complementary"]',
            '[role="contentinfo"]', '[aria-label*="navigation"]',
            '[class*="cookie"]', '[class*="gdpr"]'
        ];
        
        unwantedSelectors.forEach(selector => {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
        
        // Try to find the main article content with better selectors
        const articleSelectors = [
            'article',
            '[role="main"]',
            'main article',
            'main .content',
            'main .post',
            '.article-content',
            '.post-content',
            '.entry-content',
            '.article-body',
            '.post-body',
            '.content-body',
            '.story-body',
            '.article-text',
            '.post-text',
            '.content-area',
            '.main-content',
            '.primary-content',
            '[itemprop="articleBody"]',
            '.article-wrapper .content',
            '.post-wrapper .content'
        ];
        
        let bestElement = null;
        let bestScore = 0;
        
        // Score each potential article container
        for (const selector of articleSelectors) {
            const elements = doc.querySelectorAll(selector);
            
            for (const element of elements) {
                const score = this.scoreArticleElement(element);
                if (score > bestScore) {
                    bestScore = score;
                    bestElement = element;
                }
            }
        }
        
        if (bestElement && bestScore > 100) {
            return this.extractFormattedContent(bestElement);
        }
        
        // Fallback: try to find content in main or body, but clean it up
        const fallbackSelectors = ['main', 'body'];
        for (const selector of fallbackSelectors) {
            const element = doc.querySelector(selector);
            if (element) {
                // Remove more unwanted elements from fallback
                const moreUnwanted = element.querySelectorAll(unwantedSelectors.join(', '));
                moreUnwanted.forEach(el => el.remove());
                
                const score = this.scoreArticleElement(element);
                if (score > 50) {
                    return this.extractFormattedContent(element);
                }
            }
        }
        
        // Last resort: return cleaned body text
        return this.cleanText(doc.body.textContent.trim());
    }
    
    scoreArticleElement(element) {
        if (!element) return 0;
        
        let score = 0;
        const text = element.textContent.trim();
        const textLength = text.length;
        
        // Base score from text length
        score += Math.min(textLength / 10, 100);
        
        // Bonus for paragraph tags (indicates structured content)
        const paragraphs = element.querySelectorAll('p');
        score += paragraphs.length * 5;
        
        // Bonus for headings (indicates article structure)
        const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
        score += headings.length * 3;
        
        // Bonus for lists (indicates structured content)
        const lists = element.querySelectorAll('ul, ol, li');
        score += lists.length * 2;
        
        // Penalty for too many links (might be navigation)
        const links = element.querySelectorAll('a');
        const linkRatio = links.length / Math.max(paragraphs.length, 1);
        if (linkRatio > 2) {
            score -= linkRatio * 10;
        }
        
        // Bonus for article-like class names
        const className = element.className.toLowerCase();
        const articleKeywords = ['article', 'post', 'content', 'story', 'body', 'text'];
        for (const keyword of articleKeywords) {
            if (className.includes(keyword)) {
                score += 20;
            }
        }
        
        // Penalty for navigation-like class names
        const navKeywords = ['nav', 'menu', 'sidebar', 'header', 'footer'];
        for (const keyword of navKeywords) {
            if (className.includes(keyword)) {
                score -= 30;
            }
        }
        
        return score;
    }
    
    extractFormattedContent(element) {
        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);
        
        // Remove any remaining unwanted elements
        const unwantedInContent = clone.querySelectorAll(
            '.social-share, .share-buttons, .advertisement, .ads, .ad, ' +
            '.comments, .related-posts, .author-bio, .tags, .metadata, ' +
            '.newsletter, .subscription, script, style, noscript'
        );
        unwantedInContent.forEach(el => el.remove());
        
        // Convert to formatted text while preserving structure
        return this.htmlToFormattedText(clone);
    }
    
    htmlToFormattedText(element) {
        let result = '';
        
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) {
                    result += text + ' ';
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                
                switch (tagName) {
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        result += '\n\n' + node.textContent.trim() + '\n\n';
                        break;
                        
                    case 'p':
                        const pText = this.htmlToFormattedText(node).trim();
                        if (pText) {
                            result += pText + '\n\n';
                        }
                        break;
                        
                    case 'br':
                        result += '\n';
                        break;
                        
                    case 'ul':
                    case 'ol':
                        result += '\n' + this.htmlToFormattedText(node) + '\n';
                        break;
                        
                    case 'li':
                        const liText = this.htmlToFormattedText(node).trim();
                        if (liText) {
                            result += '• ' + liText + '\n';
                        }
                        break;
                        
                    case 'blockquote':
                        const quoteText = this.htmlToFormattedText(node).trim();
                        if (quoteText) {
                            result += '\n"' + quoteText + '"\n\n';
                        }
                        break;
                        
                    case 'strong':
                    case 'b':
                        result += '**' + node.textContent.trim() + '**';
                        break;
                        
                    case 'em':
                    case 'i':
                        result += '*' + node.textContent.trim() + '*';
                        break;
                        
                    case 'code':
                        result += '`' + node.textContent.trim() + '`';
                        break;
                        
                    case 'pre':
                        result += '\n```\n' + node.textContent.trim() + '\n```\n\n';
                        break;
                        
                    case 'div':
                    case 'section':
                    case 'article':
                        const divText = this.htmlToFormattedText(node);
                        if (divText.trim()) {
                            result += divText;
                        }
                        break;
                        
                    default:
                        // For other elements, just extract text content
                        const text = this.htmlToFormattedText(node);
                        if (text.trim()) {
                            result += text;
                        }
                        break;
                }
            }
        }
        
        return result;
    }
    
    cleanText(text) {
        // Improved text cleaning that preserves some formatting
        return text
            // Normalize whitespace but preserve intentional line breaks
            .replace(/[ \t]+/g, ' ')
            // Preserve paragraph breaks
            .replace(/\n\s*\n\s*\n+/g, '\n\n')
            // Clean up excessive spacing
            .replace(/^\s+|\s+$/gm, '')
            // Remove empty lines at start and end
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
                const formattedContent = this.formatContentForDisplay(content);
                this.elements.originalContent.innerHTML = `<div class="article-content">${formattedContent}</div>`;
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
        const chunks = this.chunkText(text, 1000);
        const translatedChunks = [];

        for (const chunk of chunks) {
            const translatedChunk = await this.translateChunk(chunk, targetLanguage);
            translatedChunks.push(translatedChunk);
        }

        // Join chunks with proper spacing to maintain formatting
        return translatedChunks.join('\n\n');
    }

    chunkText(text, maxLength) {
        const chunks = [];
        
        // Split by paragraphs first to preserve formatting
        const paragraphs = text.split('\n\n').filter(p => p.trim());
        let currentChunk = '';

        for (const paragraph of paragraphs) {
            // If adding this paragraph would exceed the limit and we have content
            if (currentChunk.length + paragraph.length > maxLength && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = paragraph;
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            }
            
            // If a single paragraph is too long, split by sentences
            if (currentChunk.length > maxLength) {
                const sentences = currentChunk.split(/[.!?]+/);
                let sentenceChunk = '';
                
                for (const sentence of sentences) {
                    if (sentenceChunk.length + sentence.length > maxLength && sentenceChunk) {
                        chunks.push(sentenceChunk.trim());
                        sentenceChunk = sentence;
                    } else {
                        sentenceChunk += sentence + '.';
                    }
                }
                
                currentChunk = sentenceChunk;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks.filter(chunk => chunk.length > 0);
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
            const formattedContent = this.formatContentForDisplay(content);
            this.elements.translatedContent.innerHTML = `<div class="article-content">${formattedContent}</div>`;
        }
    }

    formatContentForDisplay(content) {
        if (!content) return '';
        
        // Convert markdown-like formatting to HTML for better display
        let formatted = this.escapeHtml(content);
        
        // Convert headings
        formatted = formatted.replace(/^(.+)$/gm, (match, line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('•') && !trimmed.startsWith('**') && !trimmed.startsWith('*') && !trimmed.startsWith('`')) {
                // Check if this line looks like a heading (short line followed by paragraph break)
                const nextLineIndex = content.indexOf(line) + line.length;
                const nextPart = content.substring(nextLineIndex, nextLineIndex + 10);
                if (nextPart.startsWith('\n\n') && line.length < 100 && !line.includes('.')) {
                    return `<h3 class="content-heading">${trimmed}</h3>`;
                }
            }
            return match;
        });
        
        // Convert bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic text
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert inline code
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Convert code blocks
        formatted = formatted.replace(/```\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');
        
        // Convert quotes
        formatted = formatted.replace(/^"(.*?)"$/gm, '<blockquote>$1</blockquote>');
        
        // Convert bullet points
        formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');
        
        // Wrap consecutive list items in ul tags
        formatted = formatted.replace(/(<li>.*<\/li>\s*)+/gs, '<ul>$&</ul>');
        
        // Convert double line breaks to paragraphs
        const paragraphs = formatted.split('\n\n').filter(p => p.trim());
        formatted = paragraphs.map(p => {
            const trimmed = p.trim();
            if (trimmed && !trimmed.startsWith('<') && !trimmed.includes('<li>')) {
                return `<p>${trimmed}</p>`;
            }
            return trimmed;
        }).join('\n');
        
        // Clean up any remaining single line breaks
        formatted = formatted.replace(/\n(?!<)/g, '<br>');
        
        return formatted;
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
