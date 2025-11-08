import express from 'express';
import { getDB } from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// --- RUTA: POST /api/interact ---
// (Esta es la que GUARDA las calificaciones de las estrellas)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.userId; // ID del token
    const { movieId, rating, hasWatched, isFavorite } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: 'Se requiere el movieId' });
    }

    const updateData = {
      $set: {
        userId: new ObjectId(userId), // La línea que arreglamos
        movieId: movieId,
        updatedAt: new Date()
      }
    };

    if (rating !== undefined) updateData.$set.rating = rating;
    if (hasWatched !== undefined) updateData.$set.hasWatched = hasWatched;
    if (isFavorite !== undefined) updateData.$set.isFavorite = isFavorite;

    const result = await db.collection('interactions').updateOne(
      { 
        userId: new ObjectId(userId),
        movieId: movieId
      },
      updateData,
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      res.status(201).json({ message: 'Interacción creada con éxito' });
    } else {
      res.status(200).json({ message: 'Interacción actualizada con éxito' });
    }
  } catch (e) {
    console.error("Error en la interacción:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// --- RUTAS ESPECÍFICAS (DEBEN IR ANTES DE LA RUTA DINÁMICA) ---

// --- RUTA: GET /api/interact/lists/all ---
// (Esta es para que el HOME muestre "Tu Rating")
router.get('/lists/all', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const myId = new ObjectId(req.user.userId);

    const interactions = await db.collection('interactions').find(
      { userId: myId },
      { projection: { _id: 0, movieId: 1, rating: 1, hasWatched: 1, isFavorite: 1 } }
    ).toArray();
    
    const interactionsMap = interactions.reduce((acc, item) => {
      acc[item.movieId] = item;
      return acc;
    }, {});
    
    res.json(interactionsMap);

  } catch (e) {
    console.error("Error al obtener todas las interacciones:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA: GET /api/interact/lists/favorites ---
// (Esta es para el Perfil -> Mis Listas)
router.get('/lists/favorites', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const myId = new ObjectId(req.user.userId);

    const favorites = await db.collection('interactions').aggregate([
      { $match: { userId: myId, isFavorite: true } },
      { $sort: { updatedAt: -1 } },
      { $lookup: { from: 'movies', localField: 'movieId', foreignField: '_id', as: 'movieDetails' } },
      { $unwind: '$movieDetails' },
      { $replaceRoot: { newRoot: '$movieDetails' } }
    ]).toArray();
    
    res.json(favorites);

  } catch (e) {
    console.error("Error al obtener favoritos:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA: GET /api/interact/lists/watched ---
// (Esta es para el Perfil -> Mis Listas)
router.get('/lists/watched', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const myId = new ObjectId(req.user.userId);

    const watched = await db.collection('interactions').aggregate([
      { $match: { userId: myId, hasWatched: true } },
      { $sort: { updatedAt: -1 } },
      { $lookup: { from: 'movies', localField: 'movieId', foreignField: '_id', as: 'movieDetails' } },
      { $unwind: '$movieDetails' },
      { $replaceRoot: { newRoot: '$movieDetails' } }
    ]).toArray();
    
    res.json(watched);

  } catch (e) {
    console.error("Error al obtener vistas:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// --- RUTA DINÁMICA (DEBE IR AL FINAL) ---

// --- RUTA: GET /api/interact/:movieId ---
// (Esta es para la Página de Detalle)
router.get('/:movieId', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.user.userId);
    const movieId = parseInt(req.params.movieId);

    if (isNaN(movieId)) {
      return res.status(400).json({ message: 'ID de película inválido' });
    }

    const interaction = await db.collection('interactions').findOne({
      userId: userId,
      movieId: movieId
    });

    if (!interaction) {
      return res.json(null);
    }
    
    res.json(interaction);

  } catch (e) {
    console.error("Error al obtener interacción:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


export default router;