import { dbConnect } from '@/lib/dbConnect';
import { Logistics } from '@/models/Logistics';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    
    // Ellenőrizzük, hogy vannak-e adatok a kérésben
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ success: false, message: 'Nincs menthető adat' }, { status: 400 });
    }

    const newLogisticsEntry = new Logistics(body);
    await newLogisticsEntry.save();

    return NextResponse.json({ success: true, message: 'Adatok sikeresen mentve!', data: newLogisticsEntry });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Hiba történt az adatok mentése során.' }, { status: 500 });
  }
}