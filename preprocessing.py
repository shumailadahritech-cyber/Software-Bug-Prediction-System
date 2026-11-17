import pandas as pd
from sklearn.model_selection import train_test_split

# Load Dataset
df = pd.read_csv("dataset/software_bug_prediction_dataset.csv")

# Separate Features and Target
X = df.drop(["Module_ID", "Bug_Present"], axis=1)
y = df["Bug_Present"]

# Display Features
print("\nFeatures:")
print(X.head())

# Display Target
print("\nTarget:")
print(y.head())

# Split Dataset into Training and Testing
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Display Dataset Sizes
print("\nTraining Data Shape:")
print(X_train.shape)

print("\nTesting Data Shape:")
print(X_test.shape)

print("\nPreprocessing Completed Successfully!")