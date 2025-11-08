import express from 'express';
import { getDB } from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js'; // El Bouncer
import { ObjectId } from 'mongodb';

const router = express.Router();

// --- RUTA: GET /api/recommend/friends ---
router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const myId = new ObjectId(req.user.userId);

    const me = await db.collection('users').findOne({ _id: myId });
    if (!me || !me.friends || me.friends.length === 0) {
      return res.json([]);
    }
    
    const friendIds = me.friends.map(id => new ObjectId(id));

    const myWatchedInteractions = await db.collection('interactions').find({
      userId: myId,
      hasWatched: true
    }).project({ movieId: 1 }).toArray();
    
    const myWatchedMovieIds = myWatchedInteractions.map(i => i.movieId);

    const recommendations = await db.collection('interactions').aggregate([
      { 
        $match: {
          userId: { $in: friendIds },
          rating: { $gte: 8 }
        }
      },
      { 
        $match: {
          movieId: { $nin: myWatchedMovieIds }
        }
      },
      { 
        $group: {
          _id: '$movieId',
          friendCount: { $sum: 1 }
        }
      },
      { $sort: { friendCount: -1 } },
      { $limit: 40 },
      { 
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$movieDetails' },
      { 
        $project: {
          _id: 0,
          movie: '$movieDetails',
          friendCount: 1
        }
      }
    ]).toArray();

    res.json(recommendations);

  } catch (e) {
    console.error("Error en recomendación de amigos:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA: GET /api/recommend/genre ---
router.get('/genre', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const myId = new ObjectId(req.user.userId);

    const myWatchedInteractions = await db.collection('interactions').find({
      userId: myId,
      hasWatched: true
    }).project({ movieId: 1 }).toArray();
    
    const myWatchedMovieIds = myWatchedInteractions.map(i => i.movieId);

    const favoriteGenres = await db.collection('interactions').aggregate([
      {
        $match: {
          userId: myId,
          rating: { $gte: 8 }
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: 'movieId',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$movieDetails' },
      { $unwind: '$movieDetails.genres' },
      {
        $group: {
          _id: '$movieDetails.genres',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]).toArray();

    if (favoriteGenres.length === 0) {
      return res.json([]);
    }

    const topGenreNames = favoriteGenres.map(g => g._id);

    const recommendations = await db.collection('movies').find({
      genres: { $in: topGenreNames },
      _id: { $nin: myWatchedMovieIds },
      averageRating: { $gte: 7 }
    })
    .sort({ averageRating: -1 })
    .limit(40)
    .toArray();

    res.json(recommendations);

  } catch (e) {
    console.error("Error en recomendación por género:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA: GET /api/recommend/demographic ---
router.get('/demographic', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const myId = new ObjectId(req.user.userId);

    const me = await db.collection('users').findOne({ _id: myId });

    if (!me || !me.birthdate || !me.gender) {
      return res.json([]);
    }

    const myBirthdate = new Date(me.birthdate);
    const myAge = new Date(Date.now() - myBirthdate.getTime()).getUTCFullYear() - 1970;
    
  
    let ageGroupLower, ageGroupUpper;
    if (myAge < 20) { ageGroupLower = 0; ageGroupUpper = 19; }
    else if (myAge < 30) { ageGroupLower = 20; ageGroupUpper = 29; }
    else if (myAge < 40) { ageGroupLower = 30; ageGroupUpper = 39; }
    else if (myAge < 50) { ageGroupLower = 40; ageGroupUpper = 49; }
    else { ageGroupLower = 50; ageGroupUpper = 150; } // 50+


    const today = new Date();
    const lowerBirthDate = new Date(today.getFullYear() - ageGroupUpper - 1, today.getMonth(), today.getDate());
    const upperBirthDate = new Date(today.getFullYear() - ageGroupLower, today.getMonth(), today.getDate());


    const recommendations = await db.collection('users').aggregate([
      {
        $match: {
          _id: { $ne: myId },
          gender: me.gender,
          birthdate: {
            $gte: lowerBirthDate,
            $lte: upperBirthDate
          }
        }
      },
      {
        $lookup: {
          from: 'interactions',
          localField: '_id',
          foreignField: 'userId',
          as: 'userInteractions'
        }
      },
      { $unwind: '$userInteractions' },
      {
        $match: {
          'userInteractions.rating': { $gte: 8 } // Tu lógica de 8 o más
        }
      },
      {
        $group: {
          _id: '$userInteractions.movieId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 40 }, // Tu límite de 40
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$movieDetails' },
      { $replaceRoot: { newRoot: '$movieDetails' } }
    ]).toArray();
    
    res.json(recommendations);

  } catch (e) {
    console.error("Error en recomendación demográfica:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA: GET /api/recommend/director ---
router.get('/director', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const myId = new ObjectId(req.user.userId);

    const myTopInteractions = await db.collection('interactions').find({
      userId: myId,
      rating: { $gte: 9 }
    }).project({ movieId: 1 }).toArray();

    if (myTopInteractions.length === 0) return res.json([]);

    const myTopMovieIds = myTopInteractions.map(i => i.movieId);

    const myTopDirectors = await db.collection('movies').find({
      _id: { $in: myTopMovieIds },
      director: { $ne: 'No disponible' }
    }).project({ director: 1, _id: 0 }).toArray();

    if (myTopDirectors.length === 0) return res.json([]);

    const directorNames = [...new Set(myTopDirectors.map(m => m.director))];

    const recommendations = await db.collection('movies').find({
      director: { $in: directorNames },
      _id: { $nin: myTopMovieIds }
    })
    .sort({ averageRating: -1 })
    .limit(40)
    .toArray();

    res.json(recommendations);

  } catch (e) {
    console.error("Error en recomendación por director:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// --- RUTA: GET /api/recommend/actor ---
router.get('/actor', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const myId = new ObjectId(req.user.userId);

    const myTopInteractions = await db.collection('interactions').find({
      userId: myId,
      rating: { $gte: 9 }
    }).project({ movieId: 1 }).toArray();

    if (myTopInteractions.length === 0) return res.json([]);

    const myTopMovieIds = myTopInteractions.map(i => i.movieId);

    const moviesWithActors = await db.collection('movies').find({
      _id: { $in: myTopMovieIds },
      actors: { $exists: true, $ne: [] }
    }).project({ actors: 1, _id: 0 }).toArray();

    if (moviesWithActors.length === 0) return res.json([]);

    const actorNames = [...new Set(moviesWithActors.flatMap(m => m.actors))];

    const recommendations = await db.collection('movies').find({
      actors: { $in: actorNames },
      _id: { $nin: myTopMovieIds }
    })
    .sort({ averageRating: -1 })
    .limit(40)
    .toArray();

    res.json(recommendations);

  } catch (e) {
    console.error("Error en recomendación por actor:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;