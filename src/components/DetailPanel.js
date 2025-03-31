import React from 'react';

const DetailPanel = ({ country, dataType, cancerData }) => {
  const countryData = cancerData.find((item) => item.country === country || item.Country === country);

  if (!countryData) {
    return <p>No data available for {country}</p>;
  }

  return (
    <div className="detail-panel">
      <h2>Details for {country}</h2>
      <p><strong>{dataType === 'lung' ? 'Lung Cancer Rate' : 'Thyroid Cancer Rate'}:</strong> {countryData[dataType === 'lung' ? 'Lung Cancer Rate' : 'Thyroid Cancer Rate']}</p>
      <p><strong>Population:</strong> {countryData.Population}</p>
      <p><strong>Risk Factors:</strong> {countryData.Risk_Factors || 'N/A'}</p>
      <p><strong>Mortality Rate:</strong> {countryData.Mortality_Rate || 'N/A'}</p>
    </div>
  );
};

export default DetailPanel;
