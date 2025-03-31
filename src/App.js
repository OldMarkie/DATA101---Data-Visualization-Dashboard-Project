import React, { useState } from 'react';
import WorldMap from './components/WorldMap';

function App() {
  const [dataType, setDataType] = useState('lung');

  return (
    <div>
      <h1>World Cancer Data Visualization</h1>
      <select onChange={(e) => setDataType(e.target.value)}>
        <option value="lung">Lung Cancer</option>
        <option value="thyroid">Thyroid Cancer</option>
      </select>
      <WorldMap dataType={dataType} />
    </div>
  );
}

export default App;
