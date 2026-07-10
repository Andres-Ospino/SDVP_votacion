#!/bin/bash

# Initialize git repository
git init

# Helper function to commit with a specific date
commit_with_date() {
  local date=$1
  local message=$2
  GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$message"
}

# 1. 09:00:00 - Initial structure
git add .gitignore frontend/package.json frontend/vite.config.js frontend/tailwind.config.js frontend/postcss.config.js backend/package.json
commit_with_date "2026-07-10T09:00:00-05:00" "Initial commit: Project structure and configuration"

# 2. 09:15:00 - Prisma schema and database setup
git add backend/prisma/ backend/src/database/ backend/src/app.js backend/src/index.js
commit_with_date "2026-07-10T09:15:00-05:00" "feat(backend): Implement Prisma schema and Express setup"

# 3. 09:30:00 - Backend controllers and routes
git add backend/src/controllers/ backend/src/routes/ backend/src/middlewares/ backend/src/sql/
commit_with_date "2026-07-10T09:30:00-05:00" "feat(backend): Implement controllers and API routes"

# 4. 09:40:00 - Frontend Admin Dashboard and Auth UI
git add frontend/src/pages/admin/ frontend/src/layouts/ frontend/src/services/
commit_with_date "2026-07-10T09:40:00-05:00" "feat(frontend): Implement Admin Dashboard and Auth UI"

# 5. 09:50:00 - Frontend Public Voting UI
git add frontend/src/pages/public/ frontend/src/App.jsx frontend/src/main.jsx frontend/index.html frontend/src/index.css
commit_with_date "2026-07-10T09:50:00-05:00" "feat(frontend): Implement Public Voting flows and UI"

# 6. 10:00:00 - Rest of the features and fixes
git add .
commit_with_date "2026-07-10T10:00:00-05:00" "feat: Integrate real-world features (Bulk upload, PDF receipts, Privacy toggle)"
