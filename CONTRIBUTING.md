# Contributing to Eden Printify Integration

Thank you for contributing to the Eden Printify Integration project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and Yarn
- Printify API access (token and shop ID)
- Basic knowledge of TypeScript and Node.js

### Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd eden-printify-integration

# 2. Install dependencies
yarn install

# 3. Build the project
yarn build

# 4. Set up environment
yarn setup

# 5. Test the setup
yarn example
```

## 🔧 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write code in TypeScript
- Follow the existing code style
- Add proper error handling
- Include meaningful commit messages

### 3. Test Your Changes

```bash
# Build the project
yarn build

# Test your specific functionality
yarn start debug-blueprint 5
yarn start generate-template 5 50
yarn start process-with-images test-product.json
```

### 4. Update Documentation

- Update README.md if adding new features
- Update help text in `src/index.ts`
- Add examples for new commands

### 5. Commit and Push

```bash
git add .
git commit -m "feat: add new feature description"
git push origin feature/your-feature-name
```

## 📝 Code Style Guidelines

### TypeScript

- Use strict typing throughout
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Error Handling

- Always handle errors gracefully
- Provide meaningful error messages
- Use consistent error logging format
- Include error codes when available

### Logging

- Use emoji-based logging for user feedback
- Include relevant information in log messages
- Use consistent log levels (info, warn, error)

### Example Code Style

```typescript
/**
 * Uploads an image to Printify using URL-based API
 * @param imageUrl - The URL of the image to upload
 * @param fileName - The desired filename for the uploaded image
 * @returns Promise with upload result containing id, url, and preview_url
 */
private async uploadImageToPrintify(
  imageUrl: string,
  fileName: string
): Promise<{ id: string; url: string; preview_url: string }> {
  try {
    console.log(`📤 Uploading image to Printify: ${fileName}`);

    const response = await axios.post(
      "https://api.printify.com/v1/uploads/images.json",
      {
        url: imageUrl,
        file_name: fileName,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "User-Agent": "EdenPrintify/1.0.0",
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const uploadData = response.data;
    console.log(`✅ Image uploaded successfully: ${uploadData.id}`);

    return {
      id: uploadData.id,
      url: uploadData.url || uploadData.preview_url,
      preview_url: uploadData.preview_url,
    };
  } catch (error) {
    console.error(`❌ Error uploading image: ${error.message}`);
    throw new Error("Failed to upload image");
  }
}
```

## 🧪 Testing Guidelines

### Manual Testing

- Test all new commands with various inputs
- Test error scenarios and edge cases
- Verify error messages are user-friendly
- Test with different Printify API responses

### Testing Checklist

- [ ] New features work as expected
- [ ] Error handling works correctly
- [ ] Help text is accurate and helpful
- [ ] No TypeScript compilation errors
- [ ] No runtime errors in normal usage
- [ ] Edge cases are handled gracefully

### Example Test Scenarios

```bash
# Test successful image upload
yarn start process-with-images product.json

# Test with invalid blueprint ID
yarn start generate-template 99999 50

# Test with missing environment variables
unset PRINTIFY_API_TOKEN && yarn start create product.json

# Test with invalid product JSON
yarn start create invalid-product.json
```

## 📚 Documentation Standards

### README Updates

- Add new features to the features list
- Include usage examples for new commands
- Update troubleshooting section if needed
- Keep installation instructions current

### Help Text Updates

- Add new commands to the help system
- Include examples in help text
- Update command descriptions to be clear and concise

### Code Comments

- Add JSDoc comments for public methods
- Explain complex logic with inline comments
- Document API interactions and requirements

## 🔍 Code Review Process

### Before Submitting

- [ ] Code compiles without TypeScript errors
- [ ] All new functionality is tested
- [ ] Documentation is updated
- [ ] Error handling is implemented
- [ ] Logging is consistent with existing code

### Review Checklist

- [ ] Code follows project style guidelines
- [ ] Error handling is comprehensive
- [ ] Documentation is clear and complete
- [ ] No security vulnerabilities introduced
- [ ] Performance impact is acceptable

## 🐛 Bug Reports

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and logs
   - Environment details (Node.js version, OS, etc.)
3. **Include minimal reproduction case** if possible

### Bug Report Template

```markdown
## Bug Description

Brief description of the issue

## Steps to Reproduce

1. Step 1
2. Step 2
3. Step 3

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- Node.js version: X.X.X
- Yarn version: X.X.X
- OS: macOS/Windows/Linux
- Printify API token: [Yes/No]

## Error Messages
```

Paste error messages here

```

## Additional Information
Any other relevant details
```

## 💡 Feature Requests

### Suggesting Features

1. **Check existing issues** to avoid duplicates
2. **Provide clear use case** and benefits
3. **Include implementation suggestions** if possible
4. **Consider impact** on existing functionality

### Feature Request Template

```markdown
## Feature Description

Brief description of the requested feature

## Use Case

Why this feature is needed and how it would be used

## Proposed Implementation

How you think this could be implemented

## Benefits

What benefits this feature would provide

## Impact

How this might affect existing functionality
```

## 🚀 Release Process

### Version Bumping

- **Patch** (1.2.1): Bug fixes and minor improvements
- **Minor** (1.3.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Test all functionality works correctly
- [ ] Update documentation if needed
- [ ] Create release tag
- [ ] Deploy to production

## 📞 Getting Help

### Resources

- **README.md**: Comprehensive project documentation
- **TEAM_HANDOFF.md**: Detailed technical documentation
- **CHANGELOG.md**: History of changes and features
- **Printify API Docs**: https://developers.printify.com/

### Questions

- Check existing documentation first
- Search existing issues for similar questions
- Create a new issue for unanswered questions
- Tag issues appropriately (question, bug, feature, etc.)

---

## 🎉 Thank You!

Thank you for contributing to the Eden Printify Integration project! Your contributions help make this tool better for everyone who uses it.

Remember:

- **Be respectful** in all interactions
- **Help others** when you can
- **Follow the guidelines** in this document
- **Have fun** building great software! 🚀
