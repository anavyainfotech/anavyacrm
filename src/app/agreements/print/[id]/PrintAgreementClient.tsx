"use client";

import React, { useEffect } from 'react';
import AgreementTemplate from "../../../(dashboard)/clients/[id]/AgreementTemplate";

export default function PrintAgreementClient(props: any) {
  useEffect(() => {
    // Wait for fonts/styles to load then trigger print
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen py-10 print:py-0 print:bg-white flex justify-center">
      <div className="bg-white shadow-lg print:shadow-none">
        <AgreementTemplate {...props} />
      </div>
    </div>
  );
}
