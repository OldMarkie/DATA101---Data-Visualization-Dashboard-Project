import React from 'react';

const FilterPanel = ({ selectedCountry, setSelectedCountry, dataType, setDataType }) => {
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
          <option value="Philippines">Philippines</option>
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="United Kingdom">United Kingdom</option>
        </select>
      </label>
    </div>
  );
};

export default FilterPanel;
