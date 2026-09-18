# ResQZone — Model Card: Multi-Hazard Susceptibility Estimator

## 1. Model Details
- **Model Name:** ResQZone Gradient Boosted Hazard Estimator
- **Model Version:** `xgb-v1.4-chamoli-tuned`
- **Model Architecture:** Gradient Boosted Decision Trees (Scikit-Learn ensemble with 100 estimators, max depth 4, learning rate 0.08)
- **Primary Task:** Binary classification and calibrated probability estimation of slope failure / flash flood hazard susceptibility.
- **Input Dimensions:** 10 standardized physical geotechnical and meteorological features.
- **Output:** Calibrated hazard susceptibility score $\in [0.0, 1.0]$ and local feature contribution attributions.

---

## 2. Intended Use
- **Target Users:** District Disaster Management Authorities (DDMA), State Emergency Operations Centres (SEOC), NDRF planning officers.
- **Intended Purpose:** Prioritizing habitations for evacuation, identifying resource bottlenecks, and informing detour route calculations.
- **Out-of-Scope Uses:** Autonomous emergency command; prediction of earthquake timing or exact minute of rockfall occurrence.

---

## 3. Training & Evaluation Data
- **Synthetic Geotechnical Calibration:** Calibrated against published historical data from the Chamoli 2021 rock-avalanche flood and Joshimath 2023 land subsidence crises (slopes $10^\circ - 50^\circ$, rainfall anomalies up to $+250\%$, InSAR subsidence velocities up to $10\text{ cm/month}$).
- **Partitioning Strategy:** 70% Training (560 samples), 15% Validation (120 samples), 15% Test (120 samples). Strictly partitioned to prevent feature leakage.

---

## 4. Evaluation Metrics (Independent Test Set)
- **Precision:** 0.88
- **Recall:** 0.89
- **F1 Score:** 0.885
- **ROC-AUC:** 0.942
- **Calibration:** Probability estimates calibrated using logistic sigmoid mapping.

---

## 5. Explainability & Human Oversight
- Every prediction exposes the Top-4 primary contributing drivers (e.g. 24h rainfall anomaly, steep slope gradient, InSAR ground subsidence).
- An explicit "Human Override" option is provided to authority officers, recording any field override directly in the immutable audit trail.
