import React, { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Input, List, Typography } from 'antd';

import searchStyle from '../styles/Search.module.css';

const { Search } = Input;
const { Text } = Typography;

const LocationSearch = ({ handleSelect }) => {
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const {
    ready,
    value,
    suggestions: { data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['(regions)']
    },
    debounce: 300
  });

  const handleInput = (e) => {
    setValue(e.target.value);
    setShowList(true);
    setInputError(false);
  };

  const handleSelectSuggestion = (suggestion) => {
    setValue(suggestion.description);
    clearSuggestions();
    setShowList(false);
    setInputError(false);
    setLoading(true);

    getGeocode({ address: suggestion.description })
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {
        const selectedLocation = {
          address: suggestion.description,
          latLng: {
            lat: latLng.lat,
            lng: latLng.lng
          }
        };
        handleSelect(selectedLocation);
        setLoading(false);
      })
      .catch((error) => {
        console.log('Error: ', error);
        setInputError(true);
        setLoading(false);
      });
      
    setValue("");
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      if (selectedIndex === -1 && data && data.length > 0) {
        handleSelectSuggestion(data[0]);
      } else if (selectedIndex >= 0 && selectedIndex < data.length) {
        handleSelectSuggestion(data[selectedIndex]);
      } else {
        setInputError(true);
      }
    } else if (event.key === 'ArrowUp' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (event.key === 'ArrowDown' && selectedIndex < data.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleSearchIconClick = () => {
    handleKeyPress({ key: 'Enter' });
  };

  const renderSuggestions = () => {
    return (
      <List
        size="small"
        dataSource={data}
        renderItem={(suggestion, index) => {
          const {
            place_id,
            structured_formatting: { main_text, secondary_text }
          } = suggestion;

          const isSelected = selectedIndex === index;

          return (
            <List.Item
              className={searchStyle.item + (isSelected ? ' ' + searchStyle.selected : '')}              
              key={place_id}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <Text strong>{main_text}</Text> <Text type="secondary">{secondary_text}</Text>
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <div>
      <Search
        className={searchStyle.input + (inputError ? ' ' + searchStyle.error : '')}
        value={value}
        onChange={handleInput}
        disabled={!ready || loading}
        placeholder="Enter an address"
        onPressEnter={handleKeyPress}
        onKeyDown={handleKeyPress}
        onSearch={handleSearchIconClick}
      />
      {inputError && <p className={searchStyle.errorMessage}>Location not found. Please enter a valid location.</p>}
      {showList && data && renderSuggestions()}
    </div>
  );
};

export default LocationSearch;
