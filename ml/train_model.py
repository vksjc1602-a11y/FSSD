"""
AEGIS ML Pipeline Trainer
Trains TF-IDF Vectorizer + Linear Support Vector Classifier + Isolation Forest for Anomaly Detection
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from sklearn.ensemble import IsolationForest
import pickle
import os

def generate_synthetic_corpus(n_samples=5000):
    # Generates balanced annotated listing texts
    legitimate_templates = [
        "Genuine brand certified headphones with manufacturer warranty and original bill. 1 year authorized service center support.",
        "Official 2026 model laptop with high resolution IPS display and official operating system. Fast delivery by verified retailer.",
        "Brand new stainless steel analog watch with water resistance up to 50 meters. Includes authentic warranty booklet and gift box.",
        "Original high-speed NVMe internal solid state drive with genuine controller and heat spreader. Standard return policy applies.",
    ]

    fraudulent_templates = [
        "Super cheap lowest price in India! Contact seller on WhatsApp +91-9888877777 before ordering for extra 30% discount. No returns allowed.",
        "Flash sale lightning deal! Direct bank transfer or UPI payment only to courier account. Non returnable item strictly final sale.",
        "100% original copy first replica. High quality clone with fake brand name. Pay outside website to lock special promotion.",
        "Urgent clearance! Only 1 left in entire world! Send money to UPI address to avoid order cancellation. Contact seller directly.",
    ]

    texts = []
    labels = []

    for _ in range(n_samples // 2):
        texts.append(np.random.choice(legitimate_templates))
        labels.append(0)  # Safe
        texts.append(np.random.choice(fraudulent_templates))
        labels.append(1)  # High Risk / Scam

    return pd.DataFrame({"text": texts, "label": labels})

def train_pipeline():
    print("[AEGIS ML] Generating dataset...")
    df = generate_synthetic_corpus(10000)

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["label"], test_size=0.2, random_state=42, stratify=df["label"]
    )

    print(f"[AEGIS ML] Training TF-IDF Vectorizer on {len(X_train)} samples...")
    vectorizer = TfidfVectorizer(ngram_range=(1, 3), max_features=5000, sublinear_tf=True)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print("[AEGIS ML] Fitting Linear Support Vector Classifier...")
    classifier = LinearSVC(C=1.0, random_state=42)
    classifier.fit(X_train_vec, y_train)

    print("[AEGIS ML] Evaluating Model...")
    y_pred = classifier.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    os.makedirs("./models", exist_ok=True)
    with open("./models/tfidf_vectorizer.pkl", "wb") as f:
        pickle.dump(vectorizer, f)
    with open("./models/linear_svc.pkl", "wb") as f:
        pickle.dump(classifier, f)

    print("[AEGIS ML] Model artifacts saved to ./models/")

if __name__ == "__main__":
    train_pipeline()
