import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import Papa from 'papaparse';
import FilterPanel from './FilterPanel';

const WorldMap = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [thyroidCountries, setThyroidCountries] = useState(new Set());
  const [lungCountries, setLungCountries] = useState(new Set());
  const [selectedCountry, setSelectedCountry] = useState('');
  const [dataType, setDataType] = useState('lung');

  const normalizeCountryName = (name) => {
    const countryMap = {
      'USA': 'United States of America',
      'UK': 'United Kingdom',
      'DR Congo': 'Congo'
    };
    return countryMap[name] || name;
  };

  useEffect(() => {
    // Load GeoJSON
    fetch('/data/custom.geo.json')
      .then(response => response.json())
      .then(data => setGeoJsonData(data))
      .catch(err => console.error('Error loading GeoJSON:', err));

      fetch('/data/custom.geo.json')
      .then(response => response.json())
      .then(data => {
        setGeoJsonData(data);
        data.features.forEach(feature => {
          console.log('Country in GeoJSON:', feature.properties?.name);
        });
      })
      .catch(err => console.error('Error loading GeoJSON:', err));
    

    // Load Thyroid Cancer Data
    fetch('/data/thyroid_cancer_risk_data.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const countries = new Set(results.data.map(row => normalizeCountryName(row.Country)));
            setThyroidCountries(countries);
          },
        });
      })
      .catch(err => console.error('Error loading Thyroid CSV:', err));

    // Load Lung Cancer Data
    fetch('/data/lung_cancer_prediction_dataset.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const countries = new Set(results.data.map(row => normalizeCountryName(row.Country)));
            setLungCountries(countries);
          },
        });
      })
      .catch(err => console.error('Error loading Lung CSV:', err));
  }, []);

  const getCountryStyle = (feature) => {
    const countryName = feature.properties?.name;

    if (selectedCountry && countryName !== selectedCountry) {
      return { color: '#cccccc', weight: 1, fillColor: '#e0e0e0', fillOpacity: 0.3 }; // No Data
    }

    const isThyroid = thyroidCountries.has(countryName);
    const isLung = lungCountries.has(countryName);

    if (dataType === 'thyroid' && isThyroid) {
      return { color: '#005bff', weight: 1, fillColor: '#a3caff', fillOpacity: 0.5 }; // Thyroid Cancer
    } else if (dataType === 'lung' && isLung) {
      return { color: '#008000', weight: 1, fillColor: '#90ee90', fillOpacity: 0.5 }; // Lung Cancer
    } else {
      return { color: '#cccccc', weight: 1, fillColor: '#e0e0e0', fillOpacity: 0.3 }; // No Data
    }
  };

  return (
    <div>
      <FilterPanel 
        selectedCountry={selectedCountry} 
        setSelectedCountry={setSelectedCountry} 
        dataType={dataType} 
        setDataType={setDataType} 
      />

      <MapContainer
        className="map-container"
        center={[20, 0]}
        zoom={2.5}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        touchZoom={false}
        keyboard={false}
        attributionControl={false}
        worldCopyJump={false}
      >
        <TileLayer
          url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://stamen.com/">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={getCountryStyle}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
