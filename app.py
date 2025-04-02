from flask import Flask, render_template, jsonify
import pandas as pd
import plotly.express as px

app = Flask(__name__)

# Load datasets
lung_cancer_file = "lung_cancer_prediction_dataset.csv"
thyroid_cancer_file = "thyroid_cancer_risk_data.csv"

def load_data():
    lung_df = pd.read_csv(lung_cancer_file)
    thyroid_df = pd.read_csv(thyroid_cancer_file)
    return lung_df, thyroid_df

def generate_plots():
    lung_df, thyroid_df = load_data()
    
    # Lung Cancer Prevalence by Country
    fig1 = px.bar(lung_df, x="Country", y="Lung_Cancer_Prevalence_Rate", title="Lung Cancer Prevalence by Country")
    
    # Smoking vs. Lung Cancer Prevalence
    fig2 = px.scatter(lung_df, x="Years_of_Smoking", y="Lung_Cancer_Prevalence_Rate", color="Smoker",
                      title="Smoking vs. Lung Cancer Prevalence")
    
    # Thyroid Cancer Risk by Country
    fig3 = px.bar(thyroid_df, x="Country", y="Thyroid_Cancer_Risk", title="Thyroid Cancer Risk by Country")
    
    # Risk Factors Pie Chart
    risk_factors = thyroid_df[["Radiation_Exposure", "Iodine_Deficiency", "Smoking", "Obesity", "Diabetes"]].apply(pd.Series.value_counts).sum(axis=1)
    fig4 = px.pie(values=risk_factors.values, names=risk_factors.index, title="Thyroid Cancer Risk Factors Distribution")
    
    return fig1.to_html(full_html=False), fig2.to_html(full_html=False), fig3.to_html(full_html=False), fig4.to_html(full_html=False)

@app.route('/')
def home():
    fig1, fig2, fig3, fig4 = generate_plots()
    return render_template('dashboard.html', fig1=fig1, fig2=fig2, fig3=fig3, fig4=fig4)

if __name__ == '__main__':
    app.run(debug=True)
