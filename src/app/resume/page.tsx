"use client"

import React, { useEffect, useRef } from 'react';

const SvgResumeViewer = () => {
  const svgContainerRef = useRef(null);

    useEffect(() => {
        document.body.classList.add('resume-home-page');

        return () => {
            document.body.classList.remove('resume-home-page');
        };
    }, []);

  const svgPages = [
    "/static-site/svg-files/resume.svg"
  ];

  const renderSvgContent = () => {
    return (
        <div 
          ref={svgContainerRef}
          className="overflow-auto w-full max-w-4xl mx-auto"
          style={{ 
            transform: `scale(1)`, 
            transformOrigin: 'top center',
            transition: 'transform 0.3s ease'
          }}
        >
          <div className="flex flex-col space-y-4">
            {svgPages.map((page, index) => (
              <img 
                key={index} 
                src={page} 
                alt={`Resume Page ${index + 1}`} 
                className="w-full h-auto"
              />
            ))}
          </div>
        </div>
      );
  };

  return (
    <div className="resume-viewer container mx-auto my-4">
      {renderSvgContent()}
    </div>
  );
};

export default SvgResumeViewer;