import 'dotenv/config';
import { dbConnect } from './lib/dbConnect';

async function testConnection() {
  try {
    console.log('Adatbázis-kapcsolat tesztelése...');
    await dbConnect();
    console.log('✅ Sikeresen csatlakozva a MongoDB-hez!');
  } catch (error) {
    console.error('❌ Hiba történt a csatlakozás során:', error);
  } finally {
    process.exit();
  }
}

testConnection();