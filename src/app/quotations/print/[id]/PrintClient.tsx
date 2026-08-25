"use client";

import React, { useEffect } from 'react';
import QuotationTemplate from "../../../(dashboard)/clients/[id]/QuotationTemplate";

export default function PrintClient(props: any) {
  useEffect(() => {
    // Wait a brief moment to ensure fonts and styles are fully loaded
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen py-10 print:bg-white print:py-0">
      <div className="w-[210mm] mx-auto shadow-xl print:shadow-none print:w-[210mm] print:max-w-none bg-white">
        <QuotationTemplate {...props} />
      </div>
      
      {/* Floating back button, hidden in print mode */}
      <div className="fixed bottom-8 right-8 print:hidden">
        <button 
          onClick={() => window.close()} 
          className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 font-medium transition-colors"
        >
          Close Window
        </button>
      </div>
    </div>
  );
}
