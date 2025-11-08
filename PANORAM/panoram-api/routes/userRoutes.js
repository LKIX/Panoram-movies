import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import authMiddleware from '../middleware/authMiddleware.js';
import { getDB } from '../db.js'; // Importamos la conexión a la BD

const router = express.Router(); // Creamos un mini-manejador de rutas

// --- RUTA: POST /api/users/register ---
router.post('/register', async (req, res) => {
  try {
    const db = getDB();
    // 1. Obtenemos los NUEVOS campos del body
    const { username, email, password, gender, birthdate } = req.body;

    // 2. Validar que tengamos todos los datos
    if (!username || !email || !password || !gender || !birthdate) {
      return res.status(400).json({ message: 'Se requiere username, email, password, gender y birthdate' });
    }

    // 3. Revisar si el email o username ya existen
    const userExists = await db.collection('users').findOne({
      $or: [{ email: email }, { username: username }]
    });

    if (userExists) {
      return res.status(400).json({ message: 'El email o username ya está en uso' });
    }

    // 4. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Crear el nuevo documento de usuario (con los campos nuevos)
    const newUser = {
      username: username,
      email: email,
      hashedPassword: hashedPassword,
      gender: gender, // 'male' o 'female'
      birthdate: new Date(birthdate), // Guardamos como fecha
      friends: [],
      createdAt: new Date()
    };

    // 6. Insertar en la BD
    const result = await db.collection('users').insertOne(newUser);

    // 7. Crear el "Pase VIP" (Token)
    const token = jwt.sign(
      { userId: result.insertedId, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 8. Enviar el token y username al frontend
    res.status(201).json({
      token: token,
      username: newUser.username
    });

  } catch (e) {
    console.error("Error en el registro:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA: POST /api/users/login ---
router.post('/login', async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    // 1. Validar que tengamos todos los datos
    if (!email || !password) {
      return res.status(400).json({ message: 'Se requiere email y password' });
    }

    // 2. Buscar al usuario por su email
    const user = await db.collection('users').findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Comparar la contraseña enviada con la encriptada de la BD
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 4. ¡Crear el "Pase VIP" (Token)!
    const payload = {
      userId: user._id, // Guardamos el ID del usuario en el token
      username: user.username
    };

    // (Necesitaremos crear un 'JWT_SECRET' en el archivo .env)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d' // El token expira en 1 día
    });

    // 5. Responder con éxito y enviar el token
    res.json({
      message: '¡Login exitoso!',
      token: token, // <-- ¡Aquí está el Pase VIP!
      username: user.username
    });

  } catch (e) {
    console.error("Error en el login:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA: GET /api/users/search ---
// ¡Nota cómo ponemos "authMiddleware" en medio!
// Este es el "Bouncer" protegiendo la ruta.
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { q } = req.query; // "q" es lo que el usuario escribe en la barra de búsqueda

    if (!q) {
      return res.status(400).json({ message: 'Debes proveer un término de búsqueda' });
    }

    // 1. Buscamos en la colección 'users'
    // $regex busca "como" (similar a LIKE en SQL)
    // $options: 'i' lo hace "case insensitive" (no distingue mayúsculas)
    const usersFound = await db.collection('users').find({
      username: { $regex: q, $options: 'i' }
    })
    .limit(10) // Traemos un máximo de 10
    .project({ hashedPassword: 0, email: 0 }) // ¡Nunca devolvemos el password!
    .toArray();

    // 2. Devolvemos los usuarios encontrados
    res.json(usersFound);

  } catch (e) {
    console.error("Error en la búsqueda:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA: POST /api/users/addfriend ---
// ¡Protegida por el Bouncer!
router.post('/addfriend', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { friendId } = req.body; // El ID del usuario que queremos agregar

    // 1. Obtenemos nuestro propio ID (gracias al Bouncer/token)
    const myId = req.user.userId;

    // 2. Validaciones
    if (!friendId) {
      return res.status(400).json({ message: 'Se requiere el ID del amigo' });
    }
    if (friendId === myId) {
      return res.status(400).json({ message: 'No puedes agregarte a ti mismo' });
    }

    // 3. La magia: Actualizamos ambos documentos
    
    // 3.A. Añade al amigo a MI lista
    // ($addToSet solo lo añade si no existe)
    await db.collection('users').updateOne(
      { _id: new ObjectId(myId) }, // Busca MI documento
      { $addToSet: { friends: friendId } } // Añade su ID a mi array "friends"
    );

    // 3.B. Añádeme a la lista DEL AMIGO
    await db.collection('users').updateOne(
      { _id: new ObjectId(friendId) }, // Busca SU documento
      { $addToSet: { friends: myId } } // Añade MI ID a su array "friends"
    );
    
    // 4. Responder con éxito
    res.status(200).json({ message: '¡Amigo agregado con éxito!' });

  } catch (e) {
    console.error("Error agregando amigo:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ... (tus imports, y tus rutas /register, /login, /search, /addfriend...)

// --- RUTA: GET /api/users/myprofile ---
// Obtiene el perfil del usuario logeado (para saber quién es y quiénes son sus amigos)
router.get('/myprofile', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const myId = new ObjectId(req.user.userId); // ID del token

    // 1. Buscamos al usuario en la colección 'users'
    // Usamos "aggregate" para hacer una consulta más avanzada
    const myProfile = await db.collection('users').aggregate([
      {
        // Paso 1: Encontrar mi propio documento de usuario
        $match: { _id: myId }
      },
      {
        // Paso 2: "Unir" con la colección 'users' DE NUEVO
        // para obtener los detalles de mis amigos
        $lookup: {
          from: 'users',
          let: { friendIds: '$friends' }, // Variable con mi array de IDs de amigos
          pipeline: [
            {
              // Busca en 'users' donde el _id esté en mi array 'friendIds'
              $match: { 
                $expr: { $in: ['$_id', { $map: { input: '$$friendIds', as: 'id', in: { $toObjectId: '$$id' } } } ] }
              }
            },
            {
              // No devuelvas información sensible de mis amigos
              $project: { username: 1, email: 1 } 
            }
          ],
          as: 'friendDetails' // Guarda el resultado en un nuevo array
        }
      },
      {
        // Paso 3: Formatear la salida final
        $project: {
          hashedPassword: 0, // ¡Nunca devuelvas el password!
          friends: 0 // Ya no necesitamos el array de IDs, tenemos "friendDetails"
        }
      }
    ]).toArray(); // Convertir a array

    if (!myProfile || myProfile.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Devolvemos el primer (y único) resultado
    res.json(myProfile[0]);

  } catch (e) {
    console.error("Error al obtener mi perfil:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/removefriend', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { friendId } = req.body; // El ID del usuario que queremos eliminar
    const myId = req.user.userId; // Mi ID (del token)

    if (!friendId) {
      return res.status(400).json({ message: 'Se requiere el ID del amigo' });
    }

    // 1. Usa "$pull" para quitar el ID de MI array "friends"
    await db.collection('users').updateOne(
      { _id: new ObjectId(myId) },
      { $pull: { friends: friendId } }
    );

    // 2. Usa "$pull" para quitar MI ID del array "friends" DEL OTRO USUARIO
    await db.collection('users').updateOne(
      { _id: new ObjectId(friendId) },
      { $pull: { friends: myId } }
    );
    
    res.status(200).json({ message: '¡Amigo eliminado con éxito!' });

  } catch (e) {
    console.error("Error eliminando amigo:", e);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


export default router;