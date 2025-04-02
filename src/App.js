import React, { useState } from 'react';
import WorldMap from './components/WorldMap';

function App() {
  const [dataType, setDataType] = useState('lung');

  return (
    <div>
      <h1>World Cancer Data Visualization</h1>
      <WorldMap dataType={dataType} />
    </div>
  );
}

export default App;
