# Git Instructions for Crypto App

## Option 1: Initialize New Repository and Push to GitHub

### 1. Initialize Git Repository
```bash
cd /path/to/crypto_app
git init
```

### 2. Create .gitignore file (recommended)
```bash
cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF
```

### 3. Add all files
```bash
git add .
```

### 4. Make your first commit
```bash
git commit -m "Initial commit: Crypto trading dashboard"
```

### 5. Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 6. Push to GitHub
```bash
git branch -M main
git push -u origin main
```

---

## Option 2: Clone Existing Repository from GitHub

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Make your changes to the code

### 3. Check what files changed
```bash
git status
```

### 4. Add changes
```bash
# Add specific files
git add path/to/file.js

# Or add all changes
git add .
```

### 5. Commit changes
```bash
git commit -m "Description of your changes"
```

### 6. Push to GitHub
```bash
git push origin main
# or
git push origin master  # if using master branch
```

---

## Option 3: If you want to pull latest changes first

### 1. Pull latest changes from GitHub
```bash
git pull origin main
```

### 2. Resolve any conflicts if they occur

### 3. Make your changes

### 4. Add, commit, and push as above

---

## Common Git Commands Reference

```bash
# Check status
git status

# See what changed
git diff

# See commit history
git log

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout branch-name

# Merge branch
git merge branch-name

# Undo last commit (keep changes)
git reset --soft HEAD~1

# See remote repositories
git remote -v
```

---

## If you need to authenticate with GitHub

### Using HTTPS (requires Personal Access Token)
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. Use token as password when pushing

### Using SSH (recommended for frequent use)
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add SSH key to GitHub: Settings → SSH and GPG keys
3. Change remote URL: `git remote set-url origin git@github.com:USERNAME/REPO.git`

