import React, { useState } from 'react';
import WorldMap from './components/WorldMap';
import DetailPanel from './components/DetailPanel';
import FilterPanel from './components/FilterPanel';

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [dataType, setDataType] = useState('lung'); // 'lung' or 'thyroid'

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Cancer Data Visualization Dashboard</h1>
      </header>

      <FilterPanel 
        selectedCountry={selectedCountry} 
        setSelectedCountry={setSelectedCountry} 
        dataType={dataType} 
        setDataType={setDataType} 
      />

      <WorldMap 
        dataType={dataType}
        onCountrySelect={(country) => setSelectedCountry(country)}
      />

      {selectedCountry && (
        <DetailPanel 
          country={selectedCountry} 
          dataType={dataType}
        />
      )}

      <footer className="dashboard-footer">
        <p>Data Source: Provided Documentation | Developed by Group 4</p>
      </footer>
    </div>
  );
}

export default App;
