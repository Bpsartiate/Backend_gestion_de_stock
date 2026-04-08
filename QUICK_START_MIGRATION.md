# ⚡ QUICK START - Nouvel Ordinateur (5 minutes)

## Prérequis
- Node.js ≥18 < 21 installed
- MongoDB running (local or Atlas)
- Git installed

## 🚀 Démarrer en 5 étapes

### 1. Clone & Install (2 min)
```bash
git clone <repo-url> backend_Stock
cd backend_Stock
npm install
```

### 2. Configure .env (1 min)
```bash
# Copy example
cp .env.example .env

# Edit .env - Add MongoDB URI:
# MONGODB_URI=mongodb://localhost:27017/stock_management
# ou
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stock_management
```

### 3. Start Backend (1 min)
```bash
npm start

# Expected output:
# MongoDB connectée ✓
# Serveur lancé sur le port 3000 ✓
```

### 4. Start Frontend (PHP)
```
MAMP/XAMPP → Start Apache
http://localhost:8888/backend_Stock/
```

### 5. Fix Orphaned LOTs (1 min)
```bash
# Go to Postman/curl and run (ONCE):
POST http://localhost:3000/api/protected/receptions/fix/missing-lots?convertSimpleToLot=true
Header: Authorization: Bearer YOUR_TOKEN

# Expected: ~18 LOTs created
```

---

## ✅ Verify Installation

```bash
# Terminal 1: Backend runs
npm start
# ✓ MongoDB connectée
# ✓ Serveur lancé sur le port 3000

# Terminal 2: Check API
curl http://localhost:3000/api/protected/produits \
  -H "Authorization: Bearer YOUR_TOKEN"
# ✓ Returns products list
```

---

## 📚 Next: Read Documentation

1. **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Full setup details
2. **[FIX_v2_8_VALIDATION_STRICT.md](docs/FIX_v2_8_VALIDATION_STRICT.md)** - Current fixes
3. **[PHASE1_v2_QUICK_START.md](docs/PHASE1_v2_QUICK_START.md)** - Overview

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "MONGODB_URI non défini" | Add MONGODB_URI to .env |
| "Cannot find module" | Run `npm install` |
| Port 3000 in use | Change PORT in .env |
| MongoDB not connecting | Check MONGODB_URI syntax, MongoDB running |
| Frontend not loading | Check MAMP/Apache running |

---

**That's it! You're ready to continue development.** 🎉

For detailed info, see [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
