import React, { useRef, useEffect, useState } from "react";

function Map({ location, handleLocationChange }) {
  const mapRef = useRef();
  const [loading, setLoading] = useState(true);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    const centerLocation = location?.latLng;
  
    if (!centerLocation) return null;
  
    const map = new window.google.maps.Map(mapRef.current, {
      center: centerLocation,
      zoom: 14,
    });
  
    const newMarker = new window.google.maps.Marker({
      position: centerLocation,
      map: map,
      title: location?.address || "Your Location",
      draggable: true
    });
  
    const handleMarkerChange = (event) => {
      if (event.type === "click") {
        newMarker.setPosition(event.latLng);
      }
    
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: newMarker.getPosition() }, (results, status) => {
        if (status === "OK" && results.length > 0) {
          const newLocation = {
            address: results[0].formatted_address,
            latLng: {
              lat: newMarker.getPosition().lat(),
              lng: newMarker.getPosition().lng()
            }
          };
          handleLocationChange(newLocation);
        }
      });
    };
    
    window.google.maps.event.addListener(map, "click", handleMarkerChange);
    window.google.maps.event.addListener(newMarker, "dragend", handleMarkerChange);
    
  
    setMarker(newMarker);
    setLoading(false);
  }, [location, handleLocationChange]);  

  return (
    <div style={{ position: "relative" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          Loading...
        </div>
      )}
      <div ref={mapRef} style={{ height: "400px" }}></div>
    </div>
  );
}

export default Map;
