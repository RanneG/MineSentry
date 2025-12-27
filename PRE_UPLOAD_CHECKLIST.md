# Pre-Upload Checklist

## ✅ Security Verification

Before uploading to GitHub, verify these items:

### Files to Exclude (Must be in .gitignore)
- [ ] `.env` - Environment variables with credentials
- [ ] `minesentry.db` - Database file
- [ ] `venv/` - Python virtual environment
- [ ] `frontend/node_modules/` - Node.js dependencies
- [ ] `frontend/dist/` - Build output
- [ ] `__pycache__/` - Python cache
- [ ] `*.log` - Log files
- [ ] `bitcoin.conf` - Bitcoin Core configuration
- [ ] Any wallet files or private keys

### Files to Include
- [x] `README.md` - Project documentation
- [x] `LICENSE` - MIT License
- [x] `CONTRIBUTING.md` - Contribution guidelines
- [x] `SECURITY.md` - Security policy
- [x] `CODE_OF_CONDUCT.md` - Code of conduct
- [x] `.gitignore` - Git ignore rules
- [x] `.env.example` - Example environment file
- [x] `requirements.txt` - Python dependencies
- [x] `frontend/package.json` - Frontend dependencies
- [x] All source code files
- [x] Documentation files

## 🔍 Quick Verification Commands

```bash
# Check if sensitive files are ignored
git check-ignore .env minesentry.db venv/ frontend/node_modules/

# List files that will be committed (after git init)
git status

# Verify .gitignore is working
git add . --dry-run
```

## ⚠️ Final Checks

1. **No credentials in code**: Search for passwords, API keys, private keys
2. **No database files**: Ensure `.db` files are excluded
3. **No build artifacts**: Exclude `dist/`, `build/`, `__pycache__/`
4. **Documentation complete**: All docs are in place
5. **License included**: MIT License file present

## 🚀 Ready to Upload

Once all checks pass, follow `GITHUB_SETUP.md` or run `./UPLOAD_TO_GITHUB.sh`
