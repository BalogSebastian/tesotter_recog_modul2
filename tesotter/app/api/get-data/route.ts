import { Logistics } from '@/models/Logistics';
import { dbConnect }from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  
  try {
    const documents = await Logistics.find({});
    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Hiba az adatok lekérdezése során.' }, { status: 500 });
  }
}