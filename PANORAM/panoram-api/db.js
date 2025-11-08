import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config(); // Carga el .env

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('¡No se encontró MONGO_URI en el archivo .env!');
}

const client = new MongoClient(MONGO_URI);


let db;

// Función para conectar y arrancar
async function connectDB() {
  try {
    await client.connect();
    console.log("¡Conectado a la base de datos ! MongoDB lista. 🚀");
    
    db = client.db('Panoram'); 
  } catch (e) {
    console.error("Error conectando a MongoDB", e);
    process.exit(1); 
  }
}

// Función para *obtener* la base de datos ya conectada
function getDB() {
  if (!db) {
    throw new Error('¡La base de datos no está conectada!');
  }
  return db;
}


export { connectDB, getDB };