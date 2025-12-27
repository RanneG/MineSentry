# Contributing to MineSentry

Thank you for your interest in contributing to MineSentry! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/minesentry.git
   cd minesentry
   ```

2. **Set up upstream remote**
   ```bash
   git remote add upstream https://github.com/originalowner/minesentry.git
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Set up development environment**
   ```bash
   # Python backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

## 📝 Development Process

### 1. Making Changes

- **Write clear, focused commits**
- **Test your changes** before submitting
- **Update documentation** if needed
- **Follow code style guidelines** (see below)

### 2. Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(spells): Add new detection method for address clustering

fix(api): Resolve 404 error on bounty contract status endpoint

docs(readme): Update installation instructions
```

### 3. Code Style

#### Python

- Follow **PEP 8** style guide
- Use **Black** for formatting (line length: 100)
- Use **type hints** for function signatures
- Maximum line length: 100 characters
- Use descriptive variable names

```python
# Good
def calculate_bounty(report: MiningPoolReport) -> int:
    """Calculate bounty amount for a verified report."""
    base_reward = self.base_rewards.get(report.evidence_type, 25000)
    return base_reward

# Bad
def calc(r):
    return 100000
```

#### TypeScript/React

- Follow **ESLint** rules
- Use **Prettier** for formatting
- Use **functional components** with hooks
- Prefer **TypeScript** over JavaScript
- Use meaningful names

```typescript
// Good
interface ReportProps {
  reportId: string
  onUpdate: (id: string) => void
}

export default function Report({ reportId, onUpdate }: ReportProps) {
  const { data } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => apiClient.getReport(reportId),
  })
  
  return <div>{/* ... */}</div>
}

// Bad
function Report(props) {
  return <div>{props.data}</div>
}
```

### 4. Testing

**Python:**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_validation.py
```

**Frontend:**
```bash
cd frontend
npm test
npm run test:coverage
```

### 5. Submitting Changes

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changes you made and why
   - Include screenshots for UI changes
   - Ensure all tests pass

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Updated existing tests
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed code
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

## 🐛 Reporting Issues

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14.0]
- Python version: [e.g., 3.11]
- Node version: [e.g., 18.17]
- Bitcoin Core version: [e.g., 25.0]

**Additional context**
Any other relevant information.
```

### Feature Requests

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other relevant information.
```

## 📚 Documentation

- Update README.md for major changes
- Add docstrings to new functions/classes
- Update API documentation if endpoints change
- Keep CHANGELOG.md updated (if maintained)

## 🔍 Review Process

1. **Automated Checks**: CI/CD will run tests and linting
2. **Code Review**: At least one maintainer will review
3. **Feedback**: Address any requested changes
4. **Merge**: Once approved, your PR will be merged

## 🎯 Areas for Contribution

- **New Detection Methods**: Add to `spells/censorship_detection.py`
- **UI Improvements**: Enhance frontend components
- **Documentation**: Improve guides and API docs
- **Testing**: Add test coverage
- **Performance**: Optimize queries and algorithms
- **Security**: Audit and improve security practices

## ❓ Questions?

- Open a discussion on GitHub
- Check existing issues and PRs
- Review documentation files

Thank you for contributing to MineSentry! 🎉

