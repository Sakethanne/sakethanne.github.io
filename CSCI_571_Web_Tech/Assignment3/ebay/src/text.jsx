import React, { useState } from 'react';

const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',
  // Add more city names as needed
];

const Autocomplete = () => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    // Filter the cities that start with the input value
    const filteredSuggestions = cities.filter((city) =>
      city.toLowerCase().startsWith(value.toLowerCase())
    );

    // Update the suggestions list and visibility
    setSuggestions(filteredSuggestions);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    // Set the selected suggestion in the input field
    setInputValue(suggestion);
    // Hide suggestions
    setShowSuggestions(false);
  };

  const renderSuggestions = () => {
    if (showSuggestions && suggestions.length > 0) {
      return (
        <ul className="suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="autocomplete">
      <input
        type="text"
        placeholder="Search for a city"
        value={inputValue}
        onChange={handleInputChange}
      />
      {renderSuggestions()}
    </div>
  );
};

export default Autocomplete;