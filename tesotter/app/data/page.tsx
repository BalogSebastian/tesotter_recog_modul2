// app/data/page.tsx

import Link from 'next/link';

interface ILogistics {
  _id: string;
  from?: string;
  to?: string;
  loadingPlace?: string;
  loadingTime?: string;
  deliveryPlace?: string;
  deliveryTime?: string;
  freightRate?: string;
  paymentTerms?: string;
  loadingReference?: string;
  rawText?: string;
  createdAt: string;
  updatedAt: string;
}

async function getLogisticsData(): Promise<ILogistics[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-data`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Hiba az adatok lekérdezése során.');
  }
  return res.json();
}

export default async function DataPage() {
  let documents: ILogistics[] = [];
  let error = null;

  try {
    documents = await getLogisticsData();
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="min-h-screen relative font-sans p-8 md:p-12 overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed opacity-10 transition-all duration-1000 ease-in-out" 
        style={{ 
          backgroundImage: 'url(/images/bg-image.jpg)', 
        }}>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto bg-zinc-950 bg-opacity-80 rounded-xl shadow-2xl p-6 md:p-10">
        <header className="flex justify-between items-center pb-8 border-b border-zinc-700">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-300">Spontex Logistics</h1>
          <Link href="/" className="text-sm uppercase font-light text-gray-400 hover:text-white transition-colors duration-300">
            Vissza a főoldalra
          </Link>
        </header>

        <main className="py-12">
          {error && <div className="text-red-500">{error}</div>}
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc._id} className="bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300">
                  <h2 className="text-lg font-bold mb-4 text-gray-200">
                    {doc.from ? 'Strukturált adat' : 'Nyers szöveg'}
                  </h2>
                  {doc.from ? (
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><strong>Feladó:</strong> {doc.from}</li>
                      <li><strong>Címzett:</strong> {doc.to || 'N/A'}</li>
                      <li><strong>Rakodás helye:</strong> {doc.loadingPlace || 'N/A'}</li>
                      <li><strong>Rakodás ideje:</strong> {doc.loadingTime || 'N/A'}</li>
                      <li><strong>Szállítás helye:</strong> {doc.deliveryPlace || 'N/A'}</li>
                      <li><strong>Szállítás ideje:</strong> {doc.deliveryTime || 'N/A'}</li>
                      <li><strong>Díj:</strong> {doc.freightRate || 'N/A'}</li>
                      <li><strong>Referencia:</strong> {doc.loadingReference || 'N/A'}</li>
                      <li><strong>Mentve:</strong> {new Date(doc.createdAt).toLocaleString()}</li>
                    </ul>
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-400 max-h-48 overflow-y-auto">
                      {doc.rawText || 'Nincs kinyert szöveg'}
                    </pre>
                  )}
                  <p className="mt-4 text-xs text-gray-500">
                    Mentve: {new Date(doc.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <p className="text-2xl font-bold">Nincs még mentett dokumentum.</p>
              <p className="mt-2 text-sm">Az adatok az OCR funkcióval menthetőek a főoldalon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}