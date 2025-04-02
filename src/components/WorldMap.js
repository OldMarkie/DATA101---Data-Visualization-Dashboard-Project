import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import Papa from 'papaparse';
import Modal from 'react-modal';
import FilterPanel from './FilterPanel';

Modal.setAppElement('#root');

const WorldMap = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [thyroidCountries, setThyroidCountries] = useState(new Set());
  const [lungCountries, setLungCountries] = useState(new Set());
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [dataType, setDataType] = useState('lung');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [mapInteractive, setMapInteractive] = useState(true);

  const normalizeCountryName = (name) => {
    const countryMap = {
      'usa': 'United States of America',
      'uk': 'United Kingdom',
      'dr congo': 'Dem. Rep. Congo'
    };
    return countryMap[name.toLowerCase().trim()] || name.trim();
  };

  useEffect(() => {
    fetch('/data/custom.geo.json')
      .then(response => response.json())
      .then(data => setGeoJsonData(data))
      .catch(err => console.error('Error loading GeoJSON:', err));

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
    const isThyroid = thyroidCountries.has(countryName);
    const isLung = lungCountries.has(countryName);

    if (dataType === 'thyroid' && isThyroid) {
      return { color: '#005bff', weight: 1, fillColor: '#a3caff', fillOpacity: 0.5 };
    } else if (dataType === 'lung' && isLung) {
      return { color: '#008000', weight: 1, fillColor: '#90ee90', fillOpacity: 0.5 };
    } else {
      return { color: '#cccccc', weight: 1, fillColor: '#e0e0e0', fillOpacity: 0.3 };
    }
  };

  const onEachCountry = (feature, layer) => {
    const countryName = feature.properties?.name;
    const isThyroid = thyroidCountries.has(countryName);
    const isLung = lungCountries.has(countryName);

    layer.bindTooltip(countryName, { permanent: false, direction: 'auto' });

    layer.setStyle(getCountryStyle(feature));

    layer.on({
      click: () => {
        if (isThyroid || isLung) {
          setSelectedCountry(countryName);
          setModalIsOpen(true);
          setMapInteractive(false);
        }
      }
    });
  };

  const MapDisabler = () => {
    const map = useMap();
    useEffect(() => {
      if (!mapInteractive) {
        // Disable all map interactivity by setting options directly
        map.options.dragging = false;
        map.options.scrollWheelZoom = false;
        map.options.doubleClickZoom = false;
        map.options.touchZoom = false;

        map._container.style.pointerEvents = "none"; // Disable mouse events on the map
      } else {
        // Re-enable interactivity if mapInteractive is true
        map.options.dragging = true;
        map.options.scrollWheelZoom = true;
        map.options.doubleClickZoom = true;
        map.options.touchZoom = true;

        map._container.style.pointerEvents = "auto"; // Enable mouse events on the map
      }
    }, [mapInteractive, map]);
    return null;
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
        zoom={2}
        scrollWheelZoom={false} // Disable zooming by scroll
        dragging={false} // Disable panning
        doubleClickZoom={false} // Disable zooming by double-click
        touchZoom={false} // Disable zooming on touch devices
      >
        <TileLayer
          url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://stamen.com/">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapDisabler />
        {geoJsonData && (
          <GeoJSON data={geoJsonData} style={getCountryStyle} onEachFeature={onEachCountry} />
        )}
      </MapContainer>

      <Modal isOpen={modalIsOpen} onRequestClose={() => {
        setModalIsOpen(false);
        setMapInteractive(true);
      }}>
        <h2>{selectedCountry}</h2>
        <p>Data for {selectedCountry} related to {dataType} cancer.</p>
        <button onClick={() => {
          setModalIsOpen(false);
          setMapInteractive(true);
        }}>Close</button>
      </Modal>
    </div>
  );
};

export default WorldMap;
