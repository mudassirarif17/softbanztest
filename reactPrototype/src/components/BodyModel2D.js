import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ZoomIn, ZoomOut, RotateLeft } from '@mui/icons-material';

const BodyModel2D = ({ onMarkerPlaced }) => {
  const [markers, setMarkers] = useState([]);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleClick = (event) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newMarker = { x, y };
    setMarkers([...markers, newMarker]);
    if (onMarkerPlaced) {
      onMarkerPlaced(newMarker);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <Tooltip title="Zoom In">
          <IconButton onClick={handleZoomIn}>
            <ZoomIn />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={handleZoomOut}>
            <ZoomOut />
          </IconButton>
        </Tooltip>
        <Tooltip title="Rotate">
          <IconButton onClick={handleRotate}>
            <RotateLeft />
          </IconButton>
        </Tooltip>
      </Box>
      
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 400"
        onClick={handleClick}
        style={{
          transform: `scale(${scale}) rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
      >
        {/* Body Outline */}
        <g fill="#e0e0e0" stroke="#757575" strokeWidth="2">
          {/* Head */}
          <circle cx="100" cy="40" r="30" />
          
          {/* Neck */}
          <rect x="90" y="70" width="20" height="20" />
          
          {/* Torso */}
          <path d="M60,90 L140,90 L150,220 L50,220 Z" />
          
          {/* Arms */}
          <path d="M60,90 L20,160 L30,170 L75,110 Z" /> {/* Left Arm */}
          <path d="M140,90 L180,160 L170,170 L125,110 Z" /> {/* Right Arm */}
          
          {/* Legs */}
          <path d="M75,220 L65,350 L85,350 L95,220 Z" /> {/* Left Leg */}
          <path d="M105,220 L115,350 L135,350 L125,220 Z" /> {/* Right Leg */}
        </g>

        {/* Markers */}
        {markers.map((marker, index) => (
          <circle
            key={index}
            cx={marker.x}
            cy={marker.y}
            r="5"
            fill="red"
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
    </Box>
  );
};

export default BodyModel2D;
