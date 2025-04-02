import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const FilterPanel = ({ selectedCountry, setSelectedCountry, dataType, setDataType, toggleSideMenu }) => {
  const [countries, setCountries] = useState([]);
  const [sideMenuOpen, setSideMenuOpen] = useState(false); // Add state to manage side menu visibility

  const normalizeCountryName = (name) => {
    const countryMap = {
      'usa': 'United States of America',
      'uk': 'United Kingdom',
      'dr congo': 'Dem. Rep. Congo'
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
    setSideMenuOpen(true);  // Open the side menu when changing data type
    toggleSideMenu(true); // Notify the parent component (WorldMap)
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const toggleMenu = () => {
    setSideMenuOpen(prevState => !prevState);  // Toggle the side menu visibility
    toggleSideMenu(!sideMenuOpen);  // Pass the current state to the parent component
  };

  return (
    <div className="filter-panel">
      <div className="button-group">
        <button 
          onClick={() => {
            setDataType('lung');
            setSideMenuOpen(true);  // Open side menu on button click
            toggleSideMenu(true);  // Notify the parent component (WorldMap)
          }}
          className={`filter-button ${dataType === 'lung' ? 'active' : ''}`}
        >
          Lung Cancer
        </button>
        <button 
          onClick={() => {
            setDataType('thyroid');
            setSideMenuOpen(true);  // Open side menu on button click
            toggleSideMenu(true);  // Notify the parent component (WorldMap)
          }}
          className={`filter-button ${dataType === 'thyroid' ? 'active' : ''}`}
        >
          Thyroid Cancer
        </button>
      </div>

      {/* Conditionally render the side menu */}
      {sideMenuOpen && (
        <div className="side-menu">
          <h3>Side Menu</h3>
          <button onClick={toggleMenu}>Close Menu</button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
