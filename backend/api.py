import json
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn
import os

# ─────────────────────────────────────────────────────────────
# Load ML artifacts
# ─────────────────────────────────────────────────────────────
print("🔄 Loading ML model artifacts …")

try:
    model        = joblib.load("model.pkl")
    if type(model).__name__=="LogisticRegression":
        if not hasattr(model,"multi_class"):
            model.multi_class="ovr"
    preprocessor = joblib.load("preprocessor.pkl")
    le_target    = joblib.load("label_encoder.pkl")
    feat_info    = joblib.load("feature_info.pkl")
    NUM_COLS     = feat_info["num_cols"]
    CAT_COLS     = feat_info["cat_cols"]
    ALL_FEATURES = feat_info["feature_names"]
    print(f"✅ Model loaded: {type(model).__name__}")
    print(f"   Classes : {le_target.classes_.tolist()}")
    print(f"   Features: {len(ALL_FEATURES)}")
    print(f"   ALL_FEATURES list: {ALL_FEATURES}")
except FileNotFoundError as e:
    print(f"❌ Model files not found: {e}")
    print("   Run  python train_model.py  first!")
    raise SystemExit(1)

# Load metrics if available
METRICS = {}
if os.path.exists("model_metrics.json"):
    with open("model_metrics.json") as f:
        METRICS = json.load(f)

# ─────────────────────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="CrashSight Pro API",
    description="Road Traffic Accident Severity Prediction",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# ✅ Request schema — EXACTLY matches your trained model columns
# ─────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    Age_band_of_driver: Optional[str]       = Field("18-30")
    Sex_of_driver: Optional[str]            = Field("Male")
    Educational_level: Optional[str]        = Field("Junior high school")
    Vehicle_driver_relation: Optional[str]  = Field("Employee")
    Driving_experience: Optional[str]       = Field("2-5yr")
    Lanes_or_Medians: Optional[str]         = Field("Undivided Two way")
    Types_of_Junction: Optional[str]        = Field("No junction")
    Road_surface_type: Optional[str]        = Field("Asphalt roads")
    Light_conditions: Optional[str]         = Field("Daylight")
    Weather_conditions: Optional[str]       = Field("Normal")
    Type_of_collision: Optional[str]        = Field("Vehicle with vehicle collision")
    Vehicle_movement: Optional[str]         = Field("Going straight")
    Pedestrian_movement: Optional[str]      = Field("Not a Pedestrian")
    Cause_of_accident: Optional[str]        = Field("No distancing")

class SeverityResponse(BaseModel):
    severity: str
    confidence: float
    probabilities: dict
    risk_score: float
    key_factors: list
    model_used: str
    classes: list

# ─────────────────────────────────────────────────────────────
# Helper: build risk factors explanation
# ─────────────────────────────────────────────────────────────
def get_risk_factors(req: PredictRequest, severity: str) -> list:
    factors = []

    if req.Light_conditions in ["Darkness - no lighting", "Darkness - lights unlit"]:
        factors.append(f"Poor lighting condition: {req.Light_conditions}")
    if req.Weather_conditions in ["Raining", "Raining and Windy", "Fog or mist", "Snow"]:
        factors.append(f"{req.Weather_conditions} weather reduces visibility")
    if req.Driving_experience in ["Below 1yr", "1-2yr", "No Licence"]:
        factors.append(f"Low driving experience: {req.Driving_experience}")
    if req.Type_of_collision in ["Collision with pedestrians", "Rollover", "With Train"]:
        factors.append(f"High-impact collision type: {req.Type_of_collision}")
    if req.Cause_of_accident in ["Driving at high speed", "Overspeed", "Drunk driving",
                                  "Driving under the influence of drugs"]:
        factors.append(f"High-risk cause: {req.Cause_of_accident}")
    if req.Types_of_Junction in ["Y Shape", "X Shape", "O Shape"]:
        factors.append(f"Complex junction type: {req.Types_of_Junction}")
    if req.Pedestrian_movement != "Not a Pedestrian":
        factors.append(f"Pedestrian involved: {req.Pedestrian_movement}")
    if req.Age_band_of_driver in ["Under 18", "Over 51"]:
        factors.append(f"Age risk group: {req.Age_band_of_driver}")
    if req.Road_surface_type in ["Earth roads", "Gravel roads"]:
        factors.append(f"Poor road surface: {req.Road_surface_type}")
    if not factors:
        factors.append("Standard risk factors detected")
    return factors[:5]

# ─────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "app": "CrashSight Pro API",
        "version": "2.0.0",
        "status": "running",
        "model": type(model).__name__,
        "accuracy": METRICS.get("accuracy"),
        "endpoints": ["/predict", "/metrics", "/health", "/docs"],
    }

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True, "model_type": type(model).__name__}

@app.get("/metrics")
def get_metrics():
    if not METRICS:
        raise HTTPException(status_code=404, detail="Metrics file not found. Run train_model.py first.")
    return METRICS

@app.post("/predict", response_model=SeverityResponse)
def predict(req: PredictRequest):
    try:
        # Build dataframe from request
        req_dict = req.dict()
        input_df = pd.DataFrame([req_dict])

        # ✅ Reindex to match exact trained feature columns
        input_df = input_df.reindex(columns=ALL_FEATURES)

        # Fill any missing with safe defaults
        for col in input_df.columns:
            if col in NUM_COLS:
                input_df[col] = pd.to_numeric(input_df[col], errors="coerce").fillna(0)
            else:
                input_df[col] = input_df[col].astype(str).fillna("Unknown")
                input_df[col] = input_df[col].replace("nan", "Unknown")
                input_df[col] = input_df[col].replace("None", "Unknown")

        input_df = input_df.replace([np.inf, -np.inf], 0)

        print("✅ FINAL INPUT TO MODEL:\n", input_df.to_string())

        # Preprocess + predict
        X_transformed = preprocessor.transform(input_df)
        pred_idx      = model.predict(X_transformed)[0]
        pred_proba    = model.predict_proba(X_transformed)[0]

        severity   = le_target.inverse_transform([pred_idx])[0]
        confidence = float(pred_proba[pred_idx]) * 100
        proba_dict = {
            le_target.inverse_transform([i])[0]: round(float(p) * 100, 1)
            for i, p in enumerate(pred_proba)
        }

        print(f"✅ Predicted: {severity} ({confidence:.1f}%)")
        print(f"   Probabilities: {proba_dict}")

        # Risk score (0–10)
        sev_weight = {"Slight Injury": 2.5, "Serious Injury": 6.0, "Fatal Injury": 9.5}
        risk_score = round(sev_weight.get(severity, 5.0) + (confidence - 60) / 40 * 1.5, 2)
        risk_score = max(0, min(10, risk_score))

        key_factors = get_risk_factors(req, severity)

        return SeverityResponse(
            severity=severity,
            confidence=round(confidence, 1),
            probabilities=proba_dict,
            risk_score=risk_score,
            key_factors=key_factors,
            model_used=type(model).__name__,
            classes=le_target.classes_.tolist(),
        )

    except Exception as e:
        print(f"❌ PREDICTION ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch")
def predict_batch(records: list[PredictRequest]):
    return [predict(r) for r in records]

# ─────────────────────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🚀 Starting CrashSight Pro API …")
    print("   Swagger docs → http://localhost:8000/docs")
    print("   Predict      → POST http://localhost:8000/predict\n")
    import os 
    port=int(os.environ.get("PORT",8000))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=True)