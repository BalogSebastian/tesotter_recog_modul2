// A dotenv betöltése CommonJS-szel, ami megbízhatóbb
require('dotenv').config({ path: './.env.local' });

(async () => {
  try {
    const { dbConnect } = await import('./lib/dbConnect.js'); // <-- Itt történt a módosítás
    console.log('Adatbázis-kapcsolat tesztelése...');
    await dbConnect();
    console.log('✅ Sikeresen csatlakozva a MongoDB-hez!');
  } catch (error) {
    console.error('❌ Hiba történt a csatlakozás során:', error);
  } finally {
    process.exit();
  }
})();