import React from 'react';

const Logo = () => (
  <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    {/* Definitions */}
    <defs>
      {/* Main green gradient */}
      <linearGradient id="main_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#1a7431', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#27ae60', stopOpacity: 1 }} />
      </linearGradient>
      
      {/* Soft background gradient */}
      <linearGradient id="bg_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#f5f5f5', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect x="0" y="0" width="800" height="800" fill="url(#bg_gradient)"/>
    
    {/* Main logo container */}
    <g transform="translate(200, 120)">
      {/* Circle background */}
      <circle cx="200" cy="200" r="200" fill="#ffffff" stroke="#e0e0e0" strokeWidth="2"/>
      
      {/* Subtle African pattern border - minimalist and refined */}
      <circle cx="200" cy="200" r="185" fill="none" stroke="url(#main_gradient)" strokeWidth="1" strokeDasharray="3,6"/>
      
      {/* Main icon container */}
      <g transform="translate(0, -20)">
        {/* Modern house shape */}
        <path 
          d="M200,80 L100,160 L100,320 L300,320 L300,160 Z"
          fill="#ffffff"
          stroke="url(#main_gradient)"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        
        {/* Roof accent */}
        <path 
          d="M120,160 L200,95 L280,160"
          fill="none"
          stroke="url(#main_gradient)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Location pin integrated (made smaller and more transparent) */}
        <path 
          d="M200,120 C180,120 165,135 165,155 C165,175 200,220 200,220 C200,220 235,175 235,155 C235,135 220,120 200,120 Z"
          fill="url(#main_gradient)"
          fillOpacity="0.7"
        />
        
        {/* Central circle (reduced in size) */}
        <circle cx="200" cy="155" r="15" fill="#ffffff" fillOpacity="0.8"/>
        <circle cx="200" cy="155" r="8" fill="url(#main_gradient)" fillOpacity="0.7"/>
        
        {/* Door */}
        <rect x="175" y="240" width="50" height="80" rx="2" ry="2" fill="url(#main_gradient)"/>
        
        {/* Door detail - subtle African-inspired pattern */}
        <path 
          d="M188,280 L212,280 M188,290 L212,290"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Windows */}
        <rect x="135" y="195" width="40" height="30" rx="2" ry="2" fill="url(#main_gradient)"/>
        <rect x="225" y="195" width="40" height="30" rx="2" ry="2" fill="url(#main_gradient)"/>
        
        {/* Window details */}
        <path 
          d="M135,210 L175,210 M155,195 L155,225"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <path 
          d="M225,210 L265,210 M245,195 L245,225"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      </g>
    </g>
  </svg>
);

export default Logo;