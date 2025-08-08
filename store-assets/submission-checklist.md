# Chrome Web Store Submission Checklist

## Pre-Submission Requirements ✅

### Technical Requirements
- [x] **Manifest V3**: Extension uses Manifest V3 ✅
- [x] **Build System**: Working build script creates dist/ folder ✅
- [x] **Version Number**: Uses semantic versioning (1.0.0) ✅
- [x] **Description**: Clear, detailed description in manifest ✅
- [x] **Icons**: All required icon sizes (16, 32, 48, 128px) ✅
- [x] **Permissions**: Minimal permissions requested ✅
- [x] **Host Permissions**: Only YouTube domain ✅

### Store Assets
- [ ] **Screenshots**: 1-5 high-quality screenshots (1280x800 or 640x400)
- [ ] **Promotional Images**: 
  - [ ] Small tile: 440x280px (optional)
  - [ ] Large tile: 920x680px (optional)
  - [ ] Marquee: 1400x560px (optional)
- [ ] **Privacy Policy**: Hosted publicly accessible URL
- [x] **Store Description**: Prepared with keywords ✅

### Legal & Policy Requirements
- [x] **Privacy Policy**: Created and will be hosted ✅
- [x] **Open Source**: Code is publicly available ✅
- [x] **No Data Collection**: Extension doesn't collect personal data ✅
- [x] **Content Policy**: Extension follows Chrome Web Store policies ✅

## Steps to Submit

### 1. Create Developer Account
- Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- Pay one-time $5 registration fee
- Verify email and provide developer information

### 2. Upload Privacy Policy
Options:
- Host the privacy-policy.html file on GitHub Pages
- Upload to your website
- Use the provided HTML file as a standalone page
- **Recommended URL**: `https://roryglenn.github.io/YoutubeClickBaitFilter/privacy-policy.html`

### 3. Take Screenshots
Follow the screenshot-guidelines.md to capture:
- Extension in action on YouTube
- Popup interface
- Before/after comparison
- Settings customization

### 4. Final Build
```bash
npm run build
```

### 5. Create ZIP Package
```bash
cd dist
zip -r ../youtube-clickbait-filter-v1.0.0.zip .
```

### 6. Upload to Chrome Web Store
1. Go to Chrome Web Store Developer Dashboard
2. Click "Add new item"
3. Upload the ZIP file
4. Fill in store listing:
   - **Category**: Productivity
   - **Language**: English
   - **Description**: Use prepared store description
   - **Screenshots**: Upload 1-5 screenshots
   - **Privacy Policy**: Add hosted URL
   - **Support URL**: GitHub repository URL

### 7. Pricing & Distribution
- **Price**: Free
- **Regions**: All regions (or customize)
- **Visibility**: Public

### 8. Submit for Review
- Review all information
- Click "Submit for review"
- Wait for Google's review (typically 1-3 business days)

## Post-Submission

### Monitor Status
- Check dashboard for review status
- Respond to any review feedback promptly
- Once approved, extension will be live

### Future Updates
- Increment version number in manifest.json
- Run build process
- Create new ZIP
- Upload as update in dashboard

## Common Rejection Reasons to Avoid
- ❌ Excessive permissions
- ❌ Unclear functionality description
- ❌ Missing privacy policy
- ❌ Poor quality screenshots
- ❌ Trademark violations
- ❌ Misleading descriptions

## Your Extension Status
✅ **Ready for submission!** Your extension meets all technical requirements.
📸 **Next step**: Take screenshots and host privacy policy
🚀 **Then**: Create ZIP and submit to Chrome Web Store

## Support Resources
- [Chrome Web Store Policies](https://developer.chrome.com/docs/webstore/program_policies/)
- [Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [Publishing Guidelines](https://developer.chrome.com/docs/webstore/publish/)

## Estimated Timeline
- **Setup & Screenshots**: 1-2 hours
- **Store submission**: 30 minutes
- **Google review**: 1-3 business days
- **Total time to live**: 1-4 days
