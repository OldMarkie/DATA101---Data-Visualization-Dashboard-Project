import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const FilterPanel = ({ selectedCountry, setSelectedCountry, dataType, setDataType }) => {
  const [countries, setCountries] = useState([]);

  const normalizeCountryName = (name) => {
    const countryMap = {
      'USA': 'United States of America',
      'UK': 'United Kingdom',
      'DR Congo': 'Democratic Republic of the Congo'
    };
    return countryMap[name] || name;
  };

  useEffect(() => {
    const fetchData = async () => {
      const file = dataType === 'lung' 
        ? '/data/lung_cancer_prediction_dataset.csv' 
        : '/data/thyroid_cancer_risk_data.csv';

      const response = await fetch(file);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const countrySet = new Set(results.data.map(row => normalizeCountryName(row.Country)));
          setCountries([...countrySet]);
        },
      });
    };

    fetchData();
  }, [dataType]);

  const handleDataTypeChange = (e) => {
    setDataType(e.target.value);
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  return (
    <div className="filter-panel">
      <label>
        Select Data Type: 
        <select value={dataType} onChange={handleDataTypeChange}>
          <option value="lung">Lung Cancer</option>
          <option value="thyroid">Thyroid Cancer</option>
        </select>
      </label>
      <label>
        Select Country: 
        <select value={selectedCountry || ''} onChange={handleCountryChange}>
          <option value="">--Choose a country--</option>
          {countries.map((country, index) => (
            <option key={index} value={country}>{country}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default FilterPanel;
