
import streamlit as st
import pandas as pd
import joblib

# Page Configuration
st.set_page_config(
    page_title="Software Bug Prediction System",
    page_icon="🐞",
    layout="wide"
)

# Load Trained Model
model = joblib.load("model/best_model.pkl")
features = joblib.load("model/features.pkl")

# Main Heading
st.title("🐞 Software Bug Prediction System")

st.write(
    "This system uses Machine Learning to predict "
    "whether a software module is likely to contain bugs."
)

st.divider()

# Input Section
st.subheader("Enter Software Module Details")

col1, col2 = st.columns(2)

with col1:
    loc = st.number_input("Lines of Code (LOC)", min_value=1, value=500)
    complexity = st.number_input("Cyclomatic Complexity", min_value=1, value=10)
    functions = st.number_input("Number of Functions", min_value=1, value=15)
    changes = st.number_input("Code Changes", min_value=0, value=5)

with col2:
    previous_bugs = st.number_input("Previous Bugs", min_value=0, value=2)
    experience = st.number_input(
        "Developer Experience (Years)",
        min_value=0,
        value=3
    )
    coverage = st.slider(
        "Test Coverage (%)",
        min_value=0,
        max_value=100,
        value=70
    )

# Prediction Button
if st.button("Predict Bug Risk"):

    input_data = pd.DataFrame(
        [[
            loc,
            complexity,
            functions,
            changes,
            previous_bugs,
            experience,
            coverage
        ]],
        columns=features
    )

    prediction = model.predict(input_data)[0]

    st.divider()
    st.subheader("Prediction Result")

    if prediction == 1:
        st.error("⚠️ High Bug Risk: This module is predicted to be bug-prone.")
    else:
        st.success("✅ Low Bug Risk: This module is predicted to be less bug-prone.")

    st.info(
        "Note: This prediction is based on the trained sample dataset "
        "and should not be treated as a guarantee."
    )
