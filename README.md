# Article Translator

A web application that translates and transliterates design articles into multiple Indian languages using AI-powered services from Sarvam AI.

## 🎯 Purpose

This tool addresses the language barrier faced by non-English speaking designers in India by providing accurate translations and transliterations of design articles, tutorials, and resources into various Indian languages.

## ✨ Features

- **Multi-language Support**: Translate articles into 10+ Indian languages including Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Odia
- **Transliteration Support**: Convert text between different scripts (e.g., English to Devanagari)
- **Flexible Input Methods**: 
  - Fetch articles directly from URLs
  - Paste text manually for translation
- **AI-Powered Translation**: Uses Sarvam AI's advanced translation and transliteration engines
- **Enhanced User Experience**: 
  - Loading indicators with processing status
  - Streamlined header layout with integrated API key configuration
  - Responsive design for all device sizes
- **Accessibility First**: Built with WCAG guidelines in mind
- **Clean UI/UX**: Modern, intuitive interface with warm color palette

## 🏗️ Project Structure

```
article-translator/
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # Stylesheet with organized CSS
├── scripts/
│   └── app.js              # Main application logic
├── guidelines.md           # Project requirements and specifications
├── README.md              # Project documentation
└── .gitignore             # Git ignore file for sensitive data
```

## 🚀 Getting Started

### Prerequisites

1. **Sarvam AI API Key**: Get your API key from [Sarvam AI](https://www.sarvam.ai/)
2. **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

### Installation

1. **Clone or Download** the project files to your local machine
2. **Open** `index.html` in your web browser
3. **Enter your API key** in the header API key field
4. **Start translating** articles!

### Usage

1. **Configure API Key**:
   - Enter your Sarvam AI API key in the header section (top-right)
   - Click "Save" to store it securely in your browser
   - Success message will confirm the key is saved

2. **Input Article**:
   - **Option 1**: Enter a URL in the "Article URL" field and click "Fetch Article"
   - **Option 2**: Click "Or paste text directly" and paste your article text

3. **Select Language**:
   - Choose your target language from the dropdown menu
   - Translation will begin automatically with loading indicators

4. **View Results**:
   - Original article appears in the left panel
   - Translated content appears in the right panel
   - Transliteration is applied automatically where applicable

## 🌐 Supported Languages

| Language | Code | Native Name | Transliteration |
|----------|------|-------------|----------------|
| Hindi | hi-IN | हिंदी | ✅ |
| Bengali | bn-IN | বাংলা | ✅ |
| Telugu | te-IN | తెలుగు | ✅ |
| Marathi | mr-IN | मराठी | ✅ |
| Tamil | ta-IN | தமிழ் | ✅ |
| Gujarati | gu-IN | ગુજરાતી | ✅ |
| Kannada | kn-IN | ಕನ್ನಡ | ✅ |
| Malayalam | ml-IN | മലയാളം | ✅ |
| Punjabi | pa-IN | ਪੰਜਾਬੀ | ✅ |
| Odia | or-IN | ଓଡ଼ିଆ | ✅ |

## 🔧 Technical Details

### Architecture

- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Translation API**: Sarvam AI Translation API
- **Transliteration API**: Sarvam AI Transliteration API
- **CORS Handling**: Multiple proxy services for URL fetching
- **Storage**: LocalStorage for API key persistence

### Key Components

1. **ArticleTranslator Class**: Main application logic
2. **Content Extraction**: Intelligent parsing of web articles
3. **Translation Engine**: Chunked translation for long content
4. **Transliteration Engine**: Script conversion for supported languages
5. **Loading States**: Enhanced UX with processing indicators
6. **Error Handling**: Comprehensive error management
7. **Accessibility Features**: ARIA labels, keyboard navigation, screen reader support

### New Features

- **Header Layout**: API key configuration moved to header for better space utilization
- **Responsive Design**: Mobile-optimized layout that stacks vertically on smaller screens
- **Loading Indicators**: Spinner with status text during translation and article fetching
- **Transliteration**: Automatic script conversion for supported languages

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🎨 Design System

### Layout

- **Header**: Horizontal layout with title/description on left, API key configuration on right
- **Mobile**: Stacked vertical layout for smaller screens
- **Responsive**: Fluid design that adapts to all screen sizes

### Color Palette

- **Primary**: Warm oranges and browns (#D2691E, #8B4513)
- **Secondary**: Soft creams and beiges (#FFF5EB, #FFE4D3)
- **Accent**: Complementary warm tones
- **Text**: High contrast for readability

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive scaling**: Fluid typography

## 🔒 Security & Privacy

- **API Key Storage**: Stored locally in browser (not transmitted to third parties)
- **No Data Collection**: No user data is stored on external servers
- **HTTPS Required**: Secure connections for all API calls
- **Input Sanitization**: All user inputs are properly escaped

## 🐛 Troubleshooting

### Common Issues

1. **"API Error" Message**:
   - Verify your API key is correct
   - Check your internet connection
   - Ensure API key has translation and transliteration permissions

2. **"Could not fetch article" Error**:
   - Try the manual text input option
   - Check if the URL is accessible
   - Some websites block automated access

3. **Translation Not Working**:
   - Ensure you've saved your API key in the header
   - Check if the selected language is supported
   - Try with shorter text content

4. **Transliteration Issues**:
   - Transliteration is automatic for supported languages
   - Check console for any transliteration API errors
   - Some languages may have limited transliteration support

### Performance Tips

- **Large Articles**: The app automatically chunks large content for better translation
- **Multiple Languages**: Translations are cached during the session
- **Slow Networks**: The app shows loading indicators for better UX
- **Mobile Usage**: Optimized layout for touch interfaces

## 🤝 Contributing

This project follows modern web development best practices:

- **Code Style**: Clean, readable, and well-documented
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized for fast loading and smooth interactions
- **Responsive**: Mobile-first design approach

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Sarvam AI** for providing the translation and transliteration APIs
- **Google Fonts** for the Inter font family
- **CORS Proxy Services** for enabling URL fetching

## 📞 Support

For issues, questions, or suggestions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure your API key is valid and has proper permissions

---

**Built with ❤️ for the Indian design community** 