This Flask application visualizes cancer-related data, including thyroid and lung cancer mortality rates, risk factors, and choropleth maps using Plotly. This README will guide you through setting up the app on your local machine.

Requirements
Python 3.7+

Flask

Pandas

Plotly

Other dependencies listed in the requirements.txt

Step 1: Clone the Repository
Clone this repository to your local machine.

Step 2: Install Dependencies
Once your virtual environment is activated, install the required packages using the requirements.txt file.

****pip install -r requirements.txt****

Step 3: Set Up Your Datasets
Make sure the following CSV files are placed in your project directory:

lung_cancer_prediction_dataset.csv (for lung cancer data)

thyroid_cancer_risk_data.csv (for thyroid cancer data)

These CSV files are required to run the app and generate the visualizations.

Step 4: Run the Application
Once everything is set up, you can run the Flask development server:

python app.py
