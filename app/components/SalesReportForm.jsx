"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react";

export default function SalesReportForm({ onSubmit, initialData = [] }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [pref, setpref] = useState([])
  const [showpref, setshowpref] = useState(false)

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (!selected) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(selected.type)) {
      setError('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      setFile(null);
      return;
    }

    setError(null);
    setFile(selected);
  };
  useEffect(() => {
    setshowpref(true)
  }, [pref]);
  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a file before uploading.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8080/entersales", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload");
      }
      setpref(result.data)
      console.log(result.message);
      alert("Upload successful!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="mb-8">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
          />

          <Button
            onClick={handleUpload}
            className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            Upload Sales Data
          </Button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
      {showpref &&
        pref.map((element, index) => (
          <div key={index} className="mt-2 text-gray-700">
            {element.name}
          </div>
        ))
      }

    </div>
  );
}
