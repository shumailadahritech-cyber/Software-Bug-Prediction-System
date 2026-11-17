import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import accuracy_score, classification_report

# Load Dataset
df = pd.read_csv("dataset/software_bug_prediction_dataset.csv")

# Separate Features and Target
X = df.drop(["Module_ID", "Bug_Present"], axis=1)
y = df["Bug_Present"]

# Split Dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Create Models
models = {
    "Logistic Regression": Pipeline([
        ("scaler", StandardScaler()),
        ("model", LogisticRegression(max_iter=1000))
    ]),

    "Decision Tree": DecisionTreeClassifier(
        random_state=42
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )
}

# Train and Evaluate Models
results = {}

print("\nMODEL TRAINING STARTED")

for name, model in models.items():

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    results[name] = accuracy

    print("\nModel:", name)
    print("Accuracy:", round(accuracy * 100, 2), "%")

    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

# Select Best Model
best_model_name = max(results, key=results.get)
best_model = models[best_model_name]

# Create Model Folder
os.makedirs("model", exist_ok=True)

# Save Best Model
joblib.dump(best_model, "model/best_model.pkl")

# Save Feature Names
joblib.dump(list(X.columns), "model/features.pkl")

print("\nMODEL COMPARISON")

for name, accuracy in results.items():
    print(name, ":", round(accuracy * 100, 2), "%")

print("\nBest Model:", best_model_name)
print("\nBest Model Saved Successfully!")