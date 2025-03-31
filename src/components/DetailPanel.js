import React from 'react';

const DetailPanel = ({ country, dataType }) => {
  // Replace these placeholders with your actual chart components (e.g., Plotly charts)
  return (
    <div className="detail-panel">
      <h2>Details for {country}</h2>
      {dataType === 'lung' ? (
        <div>
          <h3>Lung Cancer Data</h3>
          <p>Histogram of lung cancer prevalence in {country}.</p>
          <p>Bar chart comparing risk factors and mortality rates.</p>
        </div>
      ) : (
        <div>
          <h3>Thyroid Cancer Data</h3>
          <p>Bar chart comparing malignancy rates.</p>
          <p>Biomarker density estimation and SHAP summary plot.</p>
        </div>
      )}
    </div>
  );
};

export default DetailPanel;
