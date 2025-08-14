"use client";

import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

const GeneralOcrProcessor = () => {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTesseractClick = () => {
    fileInputRef.current?.click();
  };

  const processPDF = async (file: File) => {
    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error("A fájl nem olvasható.");
        }

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
        setProgress('');
        setIsProcessing(false);
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      setExtractedText(`Érvénytelen PDF-struktúra vagy hiba történt: ${error}`);
      setIsProcessing(false);
    }
  };

  const processImage = async (file: File) => {
    setProgress('Kép feldolgozása...');

    const img = new Image();
    const reader = new FileReader();

    reader.onload = async (e) => {
      if (!e.target || !e.target.result) return;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);

        const { data: { text } } = await Tesseract.recognize(canvas, 'eng+hun', {
          logger: m => setProgress(m.status === 'recognizing text' ? `Szöveg felismerése: ${(m.progress * 100).toFixed(0)}%` : m.status),
        });

        setExtractedText(text);
        setIsProcessing(false);
      };
      img.src = e.target.result as string;
    };

    reader.readAsDataURL(file);
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setExtractedText(null);
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
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'extracted_text.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const saveDataToDb = async () => {
    if (!extractedText) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawText: extractedText }),
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
        TESOTTER BETA
      </h1>

      {(isProcessing || extractedText) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-zinc-800 text-white p-8 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => { setExtractedText(null); setSaveStatus(null); }}
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
                <h3 className="text-2xl font-bold mb-4">Kinyert szöveg:</h3>
                <pre className="whitespace-pre-wrap font-mono text-sm">{extractedText}</pre>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                  <button
                    onClick={downloadTextFile}
                    className="px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Letöltés (TXT)
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GeneralOcrProcessor;