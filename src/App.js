import React, { useState } from 'react';
import LocationSearch from './components/LocationSearch';
import Map from './components/Map';
import Table from './components/Table';

const App = () => {
  const [location, setLocation] = useState({
    address: "Bjelovar, Croatia",
    latLng: {
      lat: 45.898599,
      lng: 16.848537
    }
  });  

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleLocationChange = (updatedLocation) => {
    setLocation(updatedLocation);
  };

  return (
    <div>
      <h1>Weather App</h1>
      <LocationSearch handleSelect={handleLocationSelect} />
      <Map location={location} handleLocationChange={handleLocationChange} />
      <Table
        adr={location.address}
        lat={location.latLng.lat}
        lng={location.latLng.lng} 
      />
    </div>
  );
};

export default App;
