# 🚀 Setup Advanced Analysis

## ✅ **What's Been Added**

Your crypto platform now includes **advanced correlation analysis** with **5 scoring methods**!

---

## 📦 **Install New Dependencies**

The advanced analysis requires additional Python packages:

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

This will install:
- `scipy` - For Mahalanobis distance
- `scikit-learn` - For PCA analysis
- `matplotlib` - For bar chart visualization (standalone script)

---

## 🔄 **Restart Backend**

After installing dependencies, restart the backend:

```bash
cd backend
source venv/bin/activate
python app.py
```

---

## ✅ **That's It!**

You're now ready to use advanced analysis:

### **Option 1: Web Dashboard** ⭐
1. Start backend (port 8000)
2. Start frontend (port 5001)
3. Click "Advanced Analysis" button
4. Select a cryptocurrency

### **Option 2: Standalone Script**
```bash
cd backend
source venv/bin/activate
python crypto_correlation_analysis.py
```

---

## 📊 **Features**

✅ **Correlation Matrix** - See how indicators relate
✅ **5 Scoring Methods** - Multiple ways to analyze
✅ **Visual Bar Chart** - Compare all methods
✅ **Consensus Analysis** - See if methods agree
✅ **Web Dashboard** - Integrated UI with toggle

Enjoy! 🎉


