from flask import Flask, render_template, jsonify
import numpy as np
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

@app.route('/mortality_chart_thyroid')
def mortality_chart_thyroid():
    # Load the data
    _, thyroid_df = load_data()

    # Ensure Diagnosis is numeric
    thyroid_df['Diagnosis'] = thyroid_df['Diagnosis'].map({"Malignant": 1, "Benign": 0})

    # Create age groups for thyroid cancer data
    thyroid_df['Age_Group'] = pd.cut(thyroid_df['Age'],
                                     bins=[0, 30, 60, 100],
                                     labels=['<30', '30-60', '60+'])

    # List of columns to group by for thyroid cancer risk data
    x_columns = [
        "Gender", "Family_History", "Radiation_Exposure", "Iodine_Deficiency",
        "Smoking", "Obesity", "Thyroid_Cancer_Risk", "Age_Group"
    ]

    charts = {}

    # Define the order for Age Group categories
    age_order = ["<30", "30-60", "60+"]
    cancer_risk_order = ["Low", "Medium", "High"]

    # Function to plot diagnosis with insights
    def plot_diagnosis_chart(df_grouped, column, title, colors=None, ordered_categories=None, allow_insight=True):
    # Reorder categories if specified
        if ordered_categories:
            df_grouped = df_grouped.set_index(column).reindex(ordered_categories).reset_index()

        # Ensure the colors list is long enough to match the number of unique groups
        if colors:
            # Repeat the colors if necessary to match the number of groups
            colors = (colors * (len(df_grouped) // len(colors) + 1))[:len(df_grouped)]

        # Plot bars
        fig = px.bar(
            df_grouped,
            x=column,
            y="Diagnosis",  # Assuming 'Diagnosis' represents the malignancy rate
            title=title,
            labels={"Diagnosis": "Malignancy Rate", column: column},
            color="Diagnosis",
            color_continuous_scale="Blues",
            category_orders={"Age_Group": age_order, "Thyroid_Cancer_Risk": cancer_risk_order}
        )

        # Annotate values
        for index, value in enumerate(df_grouped["Diagnosis"].values):
            fig.add_annotation(
                x=df_grouped[column].iloc[index],
                y=value,
                text=f"{value:.2%}",
                showarrow=True,
                arrowhead=2,
                arrowsize=1,
                font=dict(size=10, color="black")
            )

        # Add insights for binary comparisons (if allowed)
        if allow_insight and len(df_grouped) == 2:
            baseline = df_grouped["Diagnosis"].iloc[0]
            comparison = df_grouped["Diagnosis"].iloc[1]

            if comparison > baseline:
                increase = ((comparison - baseline) / baseline) * 100 if baseline != 0 else np.inf
                title += f"\n({column} ↑ Risk by {increase:.1f}%)"
            else:
                decrease = ((baseline - comparison) / baseline) * 100 if baseline != 0 else np.inf
                title += f"\n({column} ↓ Risk by {decrease:.1f}%)"

        return fig


    # Loop through each column and generate the plots
    for column in x_columns:
        df_grouped = thyroid_df.groupby(column)['Diagnosis'].mean().round(2).reset_index()

        # Customize insights for gender and allow-insight categories
        if column == "Gender":
            allow_insight = False
        else:
            allow_insight = True

        # Generate the plot for each factor
        fig = plot_diagnosis_chart(
            df_grouped, column, f"Malignancy Rate by {column}",
            colors=['green', 'red'],  # Customize colors as needed
            ordered_categories=["No", "Yes"] if column in ["Family_History", "Radiation_Exposure", "Iodine_Deficiency", "Smoking", "Obesity"] else None,
            allow_insight=allow_insight
        )

        fig.update_layout(xaxis_tickangle=-45)
        charts[column] = fig.to_html(full_html=False)

    return jsonify(charts)


@app.route('/mortality_chart')
def mortality_chart():
    lung_df, _ = load_data()

    # Grouping Age into three distinct groups
    def categorize_age(age):
        if age < 30:
            return "<30"
        elif 30 <= age <= 60:
            return "30-60"
        else:
            return "60+"

    # Apply the categorize_age function to the Age column
    lung_df["Age_Group"] = lung_df["Age"].apply(categorize_age)

    # List of columns to group by
    x_columns = [
        "Treatment_Type", "Early_Detection", "Healthcare_Access", "Indoor_Pollution",
        "Occupational_Exposure", "Air_Pollution_Exposure", "Smoker", "Gender", "Age_Group"
    ]

    charts = {}

    # Define the order for Age Group categories
    age_order = ["<30", "30-60", "60+"]
    airpol_order = ["Low", "Medium", "High"]

    for column in x_columns:
        df_grouped = lung_df.groupby(column)["Mortality_Rate"].mean().round(2).reset_index()

        fig = px.bar(
            df_grouped, 
            x=column, 
            y="Mortality_Rate", 
            title=f"Mortality Rate by {column}",
            labels={"Mortality_Rate": "Mortality Rate", column: column},
            color="Mortality_Rate", 
            color_continuous_scale="Blues",
            category_orders={"Age_Group": age_order, "Air_Pollution_Exposure": airpol_order}  # Enforcing the order for Age_Group
        )

        fig.update_layout(xaxis_tickangle=-45)
        charts[column] = fig.to_html(full_html=False)

    return jsonify(charts)




def generate_highlight_map(data, title):
    fig = px.choropleth(
        data,
        locations="Country",
        locationmode="country names",
        color="Country",
        color_discrete_map={"Country": "#ff69b4"},
        title=title
    )
    fig.update_layout(
        coloraxis_showscale=True,
        coloraxis_colorbar_title="Highlighted Countries"
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
        color_continuous_scale="YlOrRd",
        title=title,
        labels={"Yes_Percentage": "Percentage (%)"}
    )
    return fig.to_html(full_html=False)

def generate_lung_cancer_maps(df_lung, map_type):
    if map_type == "prevalence":
        country_prevalence = df_lung.groupby("Country")["Lung_Cancer_Prevalence_Rate"].mean().round(2).reset_index()
        title = "Lung Cancer Prevalence Rate by Country"
        color = "Lung_Cancer_Prevalence_Rate"
    elif map_type == "deaths":
        country_prevalence = df_lung.groupby("Country")["Annual_Lung_Cancer_Deaths"].mean().round(2).reset_index()
        title = "Annual Lung Cancer Deaths by Country"
        color = "Annual_Lung_Cancer_Deaths"
    elif map_type == "development":
        development_mapping = {"Developed": 1, "Developing": 2}
        df_lung["Development_Status_Num"] = df_lung["Developed_or_Developing"].map(development_mapping)
        country_prevalence = df_lung.groupby("Country")["Development_Status_Num"].mean().round(0).reset_index()
        inverse_mapping = {1: "Developed", 2: "Developing"}
        country_prevalence["Developed_or_Developing"] = country_prevalence["Development_Status_Num"].map(inverse_mapping)
        title = "Developed vs. Developing Countries"
        color = "Developed_or_Developing"
    
    fig = px.choropleth(
        country_prevalence,
        locations="Country",
        locationmode="country names",
        color=color,
        hover_name="Country",
        color_continuous_scale="Reds" if map_type != "development" else None,
        color_discrete_map={"Developed": "green", "Developing": "red"} if map_type == "development" else None,
        title=title,
    )
    return fig.to_html(full_html=False)

@app.route('/')
def home():
    lung_df, thyroid_df = load_data()
    countries_lung = lung_df[["Country"]].drop_duplicates()
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
    elif cancer_type == "prevalence":
        map_html = generate_lung_cancer_maps(lung_df, "prevalence")
    elif cancer_type == "deaths":
        map_html = generate_lung_cancer_maps(lung_df, "deaths")
    elif cancer_type == "development":
        map_html = generate_lung_cancer_maps(lung_df, "development")
    elif cancer_type == "thyroid_prevalence":
        df = pd.read_csv(thyroid_cancer_file)
        prevalence_data = df.groupby("Country").agg(
            Thyroid_Cancer_Prevalence_Rate=("Diagnosis", lambda x: (x == "Malignant").mean() * 100),
            Malignant_Cancer_Count=("Diagnosis", lambda x: (x == "Malignant").sum())
        ).reset_index()

        fig = px.choropleth(
            prevalence_data,
            locations="Country",
            locationmode="country names",
            color="Thyroid_Cancer_Prevalence_Rate",
            color_continuous_scale="Reds",
            title="Thyroid Cancer Prevalence Rates by Country",
            labels={"Thyroid_Cancer_Prevalence_Rate": "Prevalence (%)", "Malignant_Cancer_Count": "Number of Malignant Cancers"},
            hover_name="Country",
            hover_data={"Thyroid_Cancer_Prevalence_Rate": True, "Malignant_Cancer_Count": True}
        )

        fig.update_layout(
            geo=dict(showcoastlines=True, showland=True, landcolor="rgb(217, 217, 217)"),
            coloraxis_colorbar=dict(
                title="Prevalence (%)",
                tickvals=[0, 20, 40, 60, 80, 100],
                ticktext=["0%", "20%", "40%", "60%", "80%", "100%"],
                tickmode="array"
            ),
            coloraxis=dict(
                cmin=0,
                cmax=40,
                colorscale="Reds"
            )
        )

        map_html = fig.to_html(full_html=False)
    
    else:
        return jsonify({"error": "Invalid cancer type"}), 400
    
    return jsonify({"map_html": map_html})

if __name__ == '__main__':
    app.run(debug=True)
