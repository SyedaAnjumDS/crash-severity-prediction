**🚗 Crash Severity Prediction System**
A machine learning based web application that predicts the severity of road traffic accidents as **Slight Injury**, **Serious Injury**, or **Fatal Injury** based on 14 contextual input parameters.

## 🌐 Live Demo

| Component | Link |
|-----------|------|
| 🖥️ Live App | https://crash-severity-prediction.vercel.app |
| ⚙️ API | https://crash-severity-api.onrender.com |
| 📄 API Docs | https://crash-severity-api.onrender.com/docs |

> **Note:** First request may take 30 seconds as the free server wakes up from sleep.

---

## 📌 Project Overview

This system accepts 14 categorical accident attributes and predicts the likely severity outcome in real time. It compares 5 machine learning algorithms and automatically selects the best performing model based on weighted F1-Score.

---

## ✨ Features

- Predicts crash severity with confidence percentage
- Risk score on a scale of 0 to 10
- Identifies key contributing risk factors
- Compares 5 ML models and auto-selects best
- Interactive React.js dashboard with 5 tabs
- REST API with Swagger documentation

---

## 🤖 Machine Learning

| Detail | Value |
|--------|-------|
| Dataset | Road Traffic Accident (12,484 records) |
| Input Features | 14 categorical features |
| Output Classes | Slight Injury, Serious Injury, Fatal Injury |
| Models Trained | Random Forest, Gradient Boosting, Logistic Regression, Decision Tree, XGBoost |
| Best Model | Logistic Regression |
| Accuracy | ~90% |
| F1-Score | ~90% |
| AUC-ROC | ~95% |
| Class Balancing | RandomUnderSampler (2,000 per class) |

---

## 🛠️ Technology Stack

**Backend**
- Python 3.10+
- FastAPI
- scikit-learn
- XGBoost
- pandas, NumPy
- joblib

**Frontend**
- React.js
- Recharts
- Vite

---

**📊 Output**
Each prediction returns:
✅ Severity class (Slight / Serious / Fatal Injury)
✅ Confidence percentage
✅ Probability breakdown for all 3 classes
✅ Risk score (0–10)
✅ Key contributing risk factors

---

**Developed By: S Anjum**
