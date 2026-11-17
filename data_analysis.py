import pandas as pd

# Load Dataset
df = pd.read_csv("dataset/software_bug_prediction_dataset.csv")

# Display First 5 Rows
print("\nFirst 5 Rows:")
print(df.head())

# Dataset Information
print("\nDataset Information:")
print(df.info())

# Dataset Shape
print("\nDataset Shape:")
print(df.shape)

# Check Null Values
print("\nNull Values:")
print(df.isnull().sum())

# Check Duplicate Values
print("\nDuplicate Rows:")
print(df.duplicated().sum())

# Statistical Information
print("\nStatistical Summary:")
print(df.describe())