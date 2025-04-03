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

def generate_highlight_map(data, title):
    fig = px.choropleth(
        data,
        locations="Country",
        locationmode="country names",
        color="Country",  # Use a dummy variable for coloring to enable the color scale
        color_discrete_map={"Country": "#ff69b4"},  # Set all countries to hot pink
        title=title
    )

    # Update the layout to show color scale (legend)
    fig.update_layout(
        coloraxis_showscale=True,  # Display the color scale (legend)
        coloraxis_colorbar_title="Highlighted Countries"  # Title for the color bar
    )

    return fig.to_html(full_html=False)

def generate_thyroid_choropleth(df, column_name, title):
    df[column_name + "_Num"] = df[column_name].map({"Yes": 1, "No": 0})
    country_data = df.groupby("Country")[column_name + "_Num"].mean().round(3) * 100
    country_data = country_data.reset_index().rename(columns={column_name + "_Num": "Yes_Percentage"})

    fig = px.choropleth(
        country_data,
        locations="Country",
        locationmode="country names",
        color="Yes_Percentage",
        hover_name="Country",
        color_continuous_scale="YlOrRd",  # Light yellow to dark red
        title=title,
        labels={"Yes_Percentage": "Percentage (%)"}
    )
    return fig.to_html(full_html=False)

@app.route('/')
def home():
    lung_df, thyroid_df = load_data()
    countries_lung = lung_df[["Country"]].drop_duplicates()
    
    # Render the main map with lung cancer data
    main_map = generate_highlight_map(countries_lung, "Countries with Lung Cancer Data")
    return render_template('dashboard.html', main_map=main_map)

@app.route('/highlight_map/<cancer_type>')
def highlight_map(cancer_type):
    lung_df, thyroid_df = load_data()
    
    if cancer_type == "lung":
        data = lung_df[["Country"]].drop_duplicates()
        title = "Countries with Lung Cancer Data"
        map_html = generate_highlight_map(data, title)
    elif cancer_type == "thyroid":
        data = thyroid_df[["Country"]].drop_duplicates()
        title = "Countries with Thyroid Cancer Data"
        map_html = generate_highlight_map(data, title)
    elif cancer_type == "radiation_exposure":
        map_html = generate_thyroid_choropleth(thyroid_df, "Radiation_Exposure", "Radiation Exposure Percentage by Country")
    elif cancer_type == "smoking":
        map_html = generate_thyroid_choropleth(thyroid_df, "Smoking", "Smoking Percentage by Country")
    elif cancer_type == "obesity":
        map_html = generate_thyroid_choropleth(thyroid_df, "Obesity", "Obesity Percentage by Country")
    elif cancer_type == "diabetes":
        map_html = generate_thyroid_choropleth(thyroid_df, "Diabetes", "Diabetes Percentage by Country")
    else:
        return jsonify({"error": "Invalid cancer type"}), 400
    
    return jsonify({"map_html": map_html})

if __name__ == '__main__':
    app.run(debug=True)
