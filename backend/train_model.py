import os, json, warnings
import pandas as pd
import numpy as np
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
warnings.filterwarnings("ignore")

from collections import Counter
from sklearn.model_selection   import train_test_split, cross_val_score
from sklearn.preprocessing     import LabelEncoder, OneHotEncoder
from sklearn.compose           import ColumnTransformer
from sklearn.ensemble          import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model      import LogisticRegression
from sklearn.tree              import DecisionTreeClassifier
from sklearn.metrics           import (accuracy_score, classification_report,
                                       confusion_matrix, f1_score, roc_auc_score)
from imblearn.under_sampling   import RandomUnderSampler

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False
    print("⚠  XGBoost not installed — skipping XGBoost model")

# ─────────────────────────────────────────────────────────────
# 1. LOAD DATASET
# ─────────────────────────────────────────────────────────────
# ✅ UPDATE THIS PATH TO YOUR CSV FILE
CSV_PATH = r"C:/Users/hp5cd/OneDrive/Desktop/final/backend/dataset3_augmented.csv"

df = pd.read_csv(CSV_PATH)

# ✅ Map numeric severity to text labels
# Your dataset: 0=Slight Injury, 1=Serious Injury, 2=Fatal Injury
if df["Accident_severity"].dtype in ['int64', 'float64'] or \
   df["Accident_severity"].astype(str).str.strip().isin(["0","1","2"]).any():
    severity_map = {
        0: "Slight Injury",  "0": "Slight Injury",
        1: "Serious Injury", "1": "Serious Injury",
        2: "Fatal Injury",   "2": "Fatal Injury",
    }
    df["Accident_severity"] = df["Accident_severity"].astype(str).str.strip().map(severity_map)

# Drop rows where target is missing
df.dropna(subset=["Accident_severity"], inplace=True)
df["Accident_severity"] = df["Accident_severity"].astype(str).str.strip()

print(f"\n📦 Dataset loaded: {df.shape[0]} rows × {df.shape[1]} columns")
print(f"   Class distribution:\n{df['Accident_severity'].value_counts()}\n")

# ─────────────────────────────────────────────────────────────
# 2. PREPROCESSING
# ─────────────────────────────────────────────────────────────
TARGET = "Accident_severity"

# All features (your dataset is all categorical)
feature_df = df.drop(columns=[TARGET]).copy()

# Identify column types
num_cols = feature_df.select_dtypes(include=["number"]).columns.tolist()
cat_cols = feature_df.select_dtypes(include=["object"]).columns.tolist()

# Fill missing values
for col in num_cols:
    feature_df[col] = pd.to_numeric(feature_df[col], errors='coerce')
    feature_df[col].fillna(feature_df[col].median(), inplace=True)

for col in cat_cols:
    feature_df[col].fillna(
        feature_df[col].mode()[0] if not feature_df[col].mode().empty else "Unknown",
        inplace=True
    )

feature_df = feature_df.fillna(0)

print(f"   Numeric features   : {len(num_cols)}")
print(f"   Categorical features: {len(cat_cols)}")
print(f"   Feature columns    : {list(feature_df.columns)}")

# Encode target
le_target = LabelEncoder()
y = le_target.fit_transform(df[TARGET])
X = feature_df

# ✅ Print class indices so we know exact mapping
print(f"\n🏷  Label encoding: {list(enumerate(le_target.classes_))}")
# This will print e.g. [(0, 'Fatal Injury'), (1, 'Serious Injury'), (2, 'Slight Injury')]
# We use these indices below for balancing

fatal_idx   = list(le_target.classes_).index("Fatal Injury")
serious_idx = list(le_target.classes_).index("Serious Injury")
slight_idx  = list(le_target.classes_).index("Slight Injury")
print(f"   Fatal={fatal_idx}, Serious={serious_idx}, Slight={slight_idx}")

# Preprocessor — handles both numeric and categorical
transformers = []
if num_cols:
    from sklearn.preprocessing import StandardScaler
    transformers.append(("num", StandardScaler(), num_cols))
if cat_cols:
    transformers.append(("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols))

preprocessor = ColumnTransformer(transformers=transformers)

# Train/test split — stratified to keep class ratios
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n📊 Train distribution (before balancing): {Counter(y_train)}")
print(f"   Test  distribution                    : {Counter(y_test)}")

# Transform features
X_train_t = preprocessor.fit_transform(X_train)
X_test_t  = preprocessor.transform(X_test)

# ─────────────────────────────────────────────────────────────
# 3. BALANCE CLASSES
# ✅ THIS IS THE CRITICAL FIX:
#    Step 1 — Undersample Fatal down to 800
#    Step 2 — SMOTE Serious and Slight UP to 800
#    Result — all three classes equal at 800 each
# ─────────────────────────────────────────────────────────────

# Step 1: Downsample Fatal to 800

undersample = RandomUnderSampler(
    sampling_strategy={
        fatal_idx:   2000,
        serious_idx: 2000,
        slight_idx:  2000
    },
    random_state=42
)
X_res, y_res = undersample.fit_resample(X_train_t, y_train)
print(f"\n⚖  Final balanced: {Counter(y_res)}")
print(f"   ✅ Should show 2000 Fatal, 2000 Serious, 2000 Slight\n")
# ─────────────────────────────────────────────────────────────
# 4. TRAIN MODELS
# ─────────────────────────────────────────────────────────────
models = {
    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_leaf=1,
        class_weight="balanced",   # extra safety for balance
        random_state=42,
        n_jobs=-1
    ),
    "Gradient Boosting": GradientBoostingClassifier(
        n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42
    ),
    "Logistic Regression": LogisticRegression(
        max_iter=1000, C=1.0, class_weight="balanced", random_state=42,multi_class="multinomial",solver='lbfgs'
    ),
    "Decision Tree": DecisionTreeClassifier(
        max_depth=10, class_weight="balanced", random_state=42
    ),
}
if HAS_XGB:
    models["XGBoost"] = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
        # ✅ scale_pos_weight not needed since we manually balanced
    )

results = {}
print("─"*60)
print("  MODEL TRAINING & EVALUATION")
print("─"*60)

for name, model in models.items():
    print(f"\n  Training {name}...")
    model.fit(X_res, y_res)
    preds = model.predict(X_test_t)
    acc   = accuracy_score(y_test, preds)
    f1    = f1_score(y_test, preds, average="weighted")
    try:
        proba = model.predict_proba(X_test_t)
        auc   = roc_auc_score(y_test, proba, multi_class="ovr", average="weighted")
    except:
        auc = 0.0
    # Use 2-fold CV (safe for small balanced set)
    cv_acc = cross_val_score(model, X_res, y_res, cv=2, scoring="accuracy", n_jobs=1).mean()
    results[name] = {
        "accuracy": acc, "f1": f1, "auc": auc, "cv": cv_acc,
        "model": model, "preds": preds
    }
    print(f"    Accuracy: {acc:.4f} | F1: {f1:.4f} | AUC: {auc:.4f} | CV: {cv_acc:.4f}")
    print(classification_report(y_test, preds, target_names=le_target.classes_, zero_division=0))

# ─────────────────────────────────────────────────────────────
# 5. SELECT BEST MODEL (by F1 weighted)
# ─────────────────────────────────────────────────────────────
best_name = max(results, key=lambda k: results[k]["f1"])
best      = results[best_name]
print(f"\n🏆 Best model : {best_name}")
print(f"   F1={best['f1']:.4f} | Accuracy={best['accuracy']:.4f} | AUC={best['auc']:.4f}")

# ─────────────────────────────────────────────────────────────
# 6. SAVE ARTIFACTS
# ─────────────────────────────────────────────────────────────
joblib.dump(best["model"],  "model.pkl")
joblib.dump(preprocessor,   "preprocessor.pkl")
joblib.dump(le_target,      "label_encoder.pkl")
joblib.dump({
    "num_cols": num_cols,
    "cat_cols": cat_cols,
    "feature_names": list(X.columns)
}, "feature_info.pkl")

# Save metrics JSON
cm = confusion_matrix(y_test, best["preds"]).tolist()
metrics = {
    "best_model"      : best_name,
    "accuracy"        : round(best["accuracy"], 4),
    "f1_weighted"     : round(best["f1"], 4),
    "auc_roc"         : round(best["auc"], 4),
    "cv_accuracy"     : round(best["cv"], 4),
    "classes"         : list(le_target.classes_),
    "confusion_matrix": cm,
    "all_models"      : {
        k: {"accuracy": round(v["accuracy"],4), "f1": round(v["f1"],4), "auc": round(v["auc"],4)}
        for k, v in results.items() if k != "model"
    },
}
with open("model_metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("\n💾 Saved: model.pkl | preprocessor.pkl | label_encoder.pkl | feature_info.pkl | model_metrics.json")

# ─────────────────────────────────────────────────────────────
# 7. PLOTS
# ─────────────────────────────────────────────────────────────

# Confusion Matrix
plt.figure(figsize=(7, 5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=le_target.classes_, yticklabels=le_target.classes_)
plt.title(f"Confusion Matrix — {best_name}", fontsize=13)
plt.xlabel("Predicted"); plt.ylabel("Actual")
plt.tight_layout()
plt.savefig("confusion_matrix.png", dpi=150)
plt.close()

# Feature Importance
if hasattr(best["model"], "feature_importances_"):
    try:
        ohe_features = (preprocessor.named_transformers_["cat"]
                        .get_feature_names_out(cat_cols).tolist())
        all_features = (num_cols if num_cols else []) + ohe_features
        fi = pd.Series(
            best["model"].feature_importances_,
            index=all_features[:len(best["model"].feature_importances_)]
        )
        fi = fi.nlargest(15)
        plt.figure(figsize=(10, 6))
        fi.sort_values().plot(kind="barh", color="steelblue", edgecolor="black")
        plt.title(f"Top 15 Feature Importances — {best_name}", fontsize=13)
        plt.xlabel("Importance")
        plt.tight_layout()
        plt.savefig("feature_importances.png", dpi=150)
        plt.close()
        top_features = fi.nlargest(12).index.tolist()
        joblib.dump(top_features, "top_features.pkl")
        print(f"\n📊 Top features: {top_features[:5]} …")
    except Exception as e:
        print(f"⚠  Feature importance plot skipped: {e}")

# Model Comparison
plt.figure(figsize=(10, 5))
model_names = list(results.keys())
accs = [results[m]["accuracy"] for m in model_names]
f1s  = [results[m]["f1"]       for m in model_names]
x = np.arange(len(model_names))
w = 0.35
plt.bar(x - w/2, accs, w, label="Accuracy", color="#4C72B0")
plt.bar(x + w/2, f1s,  w, label="F1-Score",  color="#55A868")
plt.xticks(x, model_names, rotation=15, ha="right")
plt.ylim(0.3, 1.0)
plt.ylabel("Score")
plt.title("Model Comparison")
plt.legend()
plt.tight_layout()
plt.savefig("model_comparison.png", dpi=150)
plt.close()

print("\n📊 Saved: confusion_matrix.png | feature_importances.png | model_comparison.png")
print("\n✅ Training complete! Run  python api.py  to start the FastAPI server.\n")