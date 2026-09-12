# Project Cleanup Implementation Plan

This plan outlines the systematic removal of unnecessary files, build artifacts, duplicates, and unused scripts from the project to clean up the codebase while ensuring stability.

## 1. Targeted Files for Removal

### 1.1 Build Artifacts & Cache
- `backend/venv/` (Python Virtual Environment)
- `**/__pycache__/` (Python compiled cache)
- `backend/.pytest_cache/` (Pytest cache)
- `frontend/node_modules/` (Node dependencies)
- `frontend/dist/` (Frontend build output)
- `backend/db.sqlite3` (Local SQLite database)

### 1.2 Duplicates
- `backend/backend/` (Redundant nested backend directory)
- `frontend/frontend/` (Redundant nested frontend directory)

### 1.3 Unused Scripts
- Root directory:
    - `audit_paths.py`
    - `check_outputs.py`
    - `robust_audit.py`
    - `list_specific.py`
- `backend/` directory:
    - `audit_buckets.py`
    - `check_bucket_config.py`
    - `debug_storage.py`
    - `verify_paths.py`
    - `test_db_connection.py`

### 1.4 Test Outputs
- `frontend/playwright-report/`
- `frontend/test-results/`

## 2. Execution Steps

### Step 1: Safety Check & Preparation
Before starting, ensure all current changes are committed to git.
```bash
git status
```

### Step 2: Remove Build Artifacts & Cache
These are regeneratable and should not be tracked.
```bash
# Remove Python venv and cache
rm -rf backend/venv/
find . -type d -name "__pycache__" -exec rm -rf {} +
rm -rf backend/.pytest_cache/

# Remove Node modules and build artifacts
rm -rf frontend/node_modules/
rm -rf frontend/dist/

# Remove local DB
rm -f backend/db.sqlite3
```

### Step 3: Remove Duplicates
Confirmed via grep that these directories are not referenced in the core codebase.
```bash
rm -rf backend/backend/
rm -rf frontend/frontend/
```

### Step 4: Remove Unused Scripts
These scripts were identified as utility/audit scripts that are no longer needed.
```bash
# Root scripts
rm -f audit_paths.py check_outputs.py robust_audit.py list_specific.py

# Backend scripts
rm -f backend/audit_buckets.py backend/check_bucket_config.py backend/debug_storage.py backend/verify_paths.py backend/test_db_connection.py
```

### Step 5: Remove Test Outputs
```bash
rm -rf frontend/playwright-report/
rm -rf frontend/test-results/
```

## 3. Verification Plan

To ensure the application remains functional and no critical imports were broken:

### 3.1 Backend Verification
Run the Django check command to verify system integrity and import paths.
```bash
# Navigate to backend and run check
cd backend
python manage.py check
cd ..
```

### 3.2 Frontend Verification
Verify that the project can still be built (which ensures `package.json` and source files are intact).
```bash
cd frontend
npm install
npm run build
cd ..
```
*(Note: `npm install` is required as `node_modules` were deleted).*

### 3.3 Git Status Audit
Confirm that only the intended files were removed.
```bash
git status
```

## 4. Final Output
After execution, a concise list of all removed files/directories will be generated and provided to the user.
