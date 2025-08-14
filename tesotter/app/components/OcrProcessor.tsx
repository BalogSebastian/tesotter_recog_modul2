"use client";

import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

interface LogisticsData {
  from?: string;
  to?: string;
  loadingPlace?: string;
  loadingTime?: string;
  deliveryPlace?: string;
  deliveryTime?: string;
  freightRate?: string;
  paymentTerms?: string;
  loadingReference?: string;
}

const extractLogisticsData = (text: string): LogisticsData => {
  const data: LogisticsData = {};
  const lines = text.split('\n');
  const regex = {
    from: /From:\s*([^\n]+)/i,
    to: /To:\s*([^\n]+)/i,
    loadingPlace: /Loading place:\s*1\.\s*([^\n]+)/i,
    loadingTime: /Loading time:\s*1\.\s*([^\n]+)/i,
    deliveryPlace: /Delivery place:\s*1\.\s*([^\n]+)/i,
    deliveryTime: /Delivery time:\s*1\.\s*([^\n]+)/i,
    freightRate: /Freight rate:\s*([^\n]+)/i,
    paymentTerms: /Payment terms:\s*([^\n]+)/i,
    loadingReference: /loading reference:\s*([^\n]+)/i,
  };

  for (const line of lines) {
    if (!data.from && regex.from.test(line)) {
      data.from = line.match(regex.from)?.[1].trim();
    }
    if (!data.to && regex.to.test(line)) {
      data.to = line.match(regex.to)?.[1].trim();
    }
    if (!data.loadingPlace && regex.loadingPlace.test(line)) {
      data.loadingPlace = line.match(regex.loadingPlace)?.[1].trim();
    }
    if (!data.loadingTime && regex.loadingTime.test(line)) {
      data.loadingTime = line.match(regex.loadingTime)?.[1].trim();
    }
    if (!data.deliveryPlace && regex.deliveryPlace.test(line)) {
      data.deliveryPlace = line.match(regex.deliveryPlace)?.[1].trim();
    }
    if (!data.deliveryTime && regex.deliveryTime.test(line)) {
      data.deliveryTime = line.match(regex.deliveryTime)?.[1].trim();
    }
    if (!data.freightRate && regex.freightRate.test(line)) {
      data.freightRate = line.match(regex.freightRate)?.[1].trim();
    }
    if (!data.paymentTerms && regex.paymentTerms.test(line)) {
      data.paymentTerms = line.match(regex.paymentTerms)?.[1].trim();
    }
    if (!data.loadingReference && regex.loadingReference.test(line)) {
      data.loadingReference = line.match(regex.loadingReference)?.[1].trim();
    }
  }

  return data;
};

const OcrProcessor = () => {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<LogisticsData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTesseractClick = () => {
    fileInputRef.current?.click();
  };

  const processPDF = async (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) return;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`PDF oldal feldolgozása: ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext,
          viewport,
          canvas: null,
        }).promise;
      
        const { data: { text } } = await Tesseract.recognize(canvas, 'eng+hun');
        fullText += text + '\n\n';
      }

      setExtractedText(fullText);
      setExtractedData(extractLogisticsData(fullText));
      setProgress('');
      setIsProcessing(false);
    };
    fileReader.readAsArrayBuffer(file);
  };

  const processImage = async (file: File) => {
    setProgress('Kép feldolgozása...');
    const { data: { text } } = await Tesseract.recognize(file, 'eng+hun', {
      logger: m => setProgress(m.status === 'recognizing text' ? `Szöveg felismerése: ${(m.progress * 100).toFixed(0)}%` : m.status),
    });
    setExtractedText(text);
    setExtractedData(extractLogisticsData(text));
    setIsProcessing(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setExtractedText(null);
      setExtractedData(null);
      setSaveStatus(null);
      setProgress('');

      if (file.type === 'application/pdf') {
        await processPDF(file);
      } else if (file.type.startsWith('image/')) {
        await processImage(file);
      } else {
        setExtractedText('Nem támogatott fájltípus.');
        setIsProcessing(false);
      }
    }
  };

  const downloadTextFile = () => {
    const textToDownload = JSON.stringify(extractedData, null, 2);
    if (textToDownload) {
      const blob = new Blob([textToDownload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'extracted_data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const saveDataToDb = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractedData),
      });

      const result = await response.json();
      if (response.ok) {
        setSaveStatus('Sikeresen mentve az adatbázisba!');
      } else {
        setSaveStatus(`Hiba: ${result.message}`);
      }
    } catch (error) {
      setSaveStatus('Hálózati hiba történt a mentés során.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,application/pdf"
      />

      <h1 
        className="text-4xl lg:text-5xl font-bold tracking-tight cursor-pointer"
        onClick={handleTesseractClick}
      >
        TESOTTER
      </h1>

      {(isProcessing || extractedData || extractedText) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-zinc-800 text-white p-8 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => { setExtractedText(null); setExtractedData(null); setSaveStatus(null); }}
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-400"
            >
              &times;
            </button>
            {isProcessing ? (
              <div className="text-center">
                <p className="text-lg">Kép/PDF feldolgozása...</p>
                <p className="text-sm opacity-70 mt-2">{progress}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold mb-4">Kinyert adatok:</h3>
                {extractedData ? (
                  <>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      {Object.entries(extractedData).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <dt className="text-sm font-semibold text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</dt>
                          <dd className="mt-1 text-base">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                      <button
                        onClick={downloadTextFile}
                        className="px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Letöltés (JSON)
                      </button>
                      <button
                        onClick={saveDataToDb}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Mentés...' : 'Mentés adatbázisba'}
                      </button>
                    </div>
                    {saveStatus && (
                      <p className="mt-4 text-sm text-center">{saveStatus}</p>
                    )}
                  </>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold mb-2">Sikertelen adatkivonás. Nyers szöveg:</h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-zinc-700 p-4 rounded">{extractedText}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OcrProcessor;