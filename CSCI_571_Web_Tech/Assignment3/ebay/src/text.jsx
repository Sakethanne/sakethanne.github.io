import React, { useState } from 'react';
import './App.css';

function New() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedLink, setSelectedLink] = useState('');

  const openOverlay = (link) => {
    setSelectedLink(link);
    setShowOverlay(true);
    document.body.style.overflow = 'hidden'; // Disable scrolling on the background
  };

  const closeOverlay = () => {
    setSelectedLink('');
    setShowOverlay(false);
    document.body.style.overflow = 'auto'; // Enable scrolling on the background
  };

  return (
    <div className="App">
      <h1>Links</h1>
      <ul>
        <li>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer">Link 1</a>
          <button onClick={() => openOverlay('https://example.com')}>Open in Overlay</button>
        </li>
        {/* Add more links with their respective buttons */}
      </ul>

      {showOverlay && (
        <div className="overlay-background">
          <div className="overlay">
            <button className="close-button" onClick={closeOverlay}>Close</button>
            <iframe title="Overlay Content" src={selectedLink} />
          </div>
        </div>
      )}
    </div>
  );
}

export default New;
