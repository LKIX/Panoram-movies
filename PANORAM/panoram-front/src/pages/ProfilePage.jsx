import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './ProfilePage.css';
import toast from 'react-hot-toast';
import MovieCarousel from '../components/MovieCarousel.jsx'; // Lo usamos para "Mis Listas"

function ProfilePage() {
  const { username } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('amigos'); // Pestaña activa
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para "Amigos"
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myFriends, setMyFriends] = useState([]);

  // Estados para "Mis Listas"
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Carga el perfil principal (y amigos) al inicio
  useEffect(() => {
    fetchMyProfile();
  }, []);

  // Carga las listas solo si se hace clic en la pestaña
  useEffect(() => {
    if (activeTab === 'listas' && favoriteMovies.length === 0 && watchedMovies.length === 0) {
      fetchMyLists();
    }
  }, [activeTab]);

  // Carga mi perfil y la lista de amigos actuales
  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/users/myprofile');
      setProfile(response.data);
      setMyFriends(response.data.friendDetails || []);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar el perfil:", err);
      setLoading(false);
    }
  };

  // Carga las listas de películas
  const fetchMyLists = async () => {
    setLoadingLists(true);
    try {
      const [favResponse, watchedResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/interact/lists/favorites'),
        axios.get('http://localhost:5001/api/interact/lists/watched')
      ]);
      setFavoriteMovies(favResponse.data);
      setWatchedMovies(watchedResponse.data);
    } catch (err) {
      toast.error("No se pudieron cargar tus listas");
    }
    setLoadingLists(false);
  };
  
  // --- ¡AQUÍ ESTÁ LA FUNCIÓN CORREGIDA! ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) {
      setSearchResults([]); // Limpia si la búsqueda es muy corta
      return;
    }
    try {
      // Llama a la ruta de USUARIOS (/api/users/search)
      // y usa el parámetro "?q=" (como en userRoutes.js)
      const response = await axios.get(`http://localhost:5001/api/users/search?q=${searchQuery}`);
      
      // Filtra para no mostrarte a ti mismo en los resultados
      const filteredResults = response.data.filter(user => user.username !== username);
      setSearchResults(filteredResults);

    } catch (err) {
      console.error("Error al buscar usuarios:", err);
      toast.error('Error al buscar usuarios');
    }
  };
  
  // Función para agregar amigos
  const handleAddFriend = async (friendId) => {
    try {
      await axios.post('http://localhost:5001/api/users/addfriend', { friendId });
      toast.success('¡Amigo agregado con éxito!');
      fetchMyProfile(); // Actualiza la lista de amigos
      setSearchResults([]); // Limpia los resultados de búsqueda
      setSearchQuery(''); // Limpia la barra de búsqueda
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al agregar';
      toast.error(errorMsg);
    }
  };

  // Lógica para confirmar y eliminar amigos
  const performRemoveFriend = async (friendId) => {
    try {
      await axios.post('http://localhost:5001/api/users/removefriend', { friendId });
      toast.success('Amigo eliminado');
      fetchMyProfile(); // Actualiza la lista
    } catch (err) {
      toast.error('Error al eliminar al amigo');
    }
  };

  const handleRemoveFriend = (friendId, friendUsername) => {
    toast.custom((t) => (
      <div className="confirmation-toast">
        <p>¿Seguro que quieres eliminar a <strong>@{friendUsername}</strong>?</p>
        <div className="toast-buttons">
          <button
            className="toast-button-confirm"
            onClick={() => {
              performRemoveFriend(friendId);
              toast.dismiss(t.id);
            }}
          >
            Sí, eliminar
          </button>
          <button
            className="toast-button-cancel"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
        </div>
      </div>
    ), { position: 'top-center' });
  };
  
  if (loading || !profile) return <div>Cargando perfil...</div>;

  return (
    <div className="profile-page">
      {/* --- Encabezado --- */}
      <div className="profile-header">
        <div className="profile-avatar">{username.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h1>@{username}</h1>
          <p>{myFriends.length} amigos</p>
        </div>
      </div>

      {/* --- Selector de Pestañas --- */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'amigos' ? 'active' : ''}`}
          onClick={() => setActiveTab('amigos')}
        >
          Amigos
        </button>
        <button 
          className={`tab-button ${activeTab === 'listas' ? 'active' : ''}`}
          onClick={() => setActiveTab('listas')}
        >
          Mis Listas
        </button>
      </div>

      {/* --- Contenido de las Pestañas --- */}
      <div className="tab-content">
        
        {/* === Pestaña AMIGOS === */}
        {activeTab === 'amigos' && (
          <div className="friends-tab">
            {/* Barra de búsqueda (conectada a handleSearch) */}
            <form onSubmit={handleSearch} className="search-bar">
              <input 
                type="text" 
                placeholder="Buscar usuarios..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Buscar</button>
            </form>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="friends-list">
                <h3>Resultados de Búsqueda</h3>
                {searchResults.map(user => (
                  <div key={user._id} className="friend-item">
                    <p>@{user.username}</p>
                    <button onClick={() => handleAddFriend(user._id)}>+ Agregar</button>
                  </div>
                ))}
              </div>
            )}

            {/* Amigos Actuales */}
            <div className="friends-list">
              <h3>Mis Amigos Actuales</h3>
              {myFriends.length > 0 ? (
                myFriends.map(friend => (
                  <div key={friend._id} className="friend-item">
                    <p>@{friend.username}</p>
                    <button 
                      className="remove-button" 
                      onClick={() => handleRemoveFriend(friend._id, friend.username)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))
              ) : (
                <p>Aún no tienes amigos. ¡Busca y agrega algunos!</p>
              )}
            </div>
          </div>
        )}

        {/* === Pestaña MIS LISTAS === */}
        {activeTab === 'listas' && (
          <div className="lists-tab">
            {loadingLists ? (
              <p>Cargando tus listas...</p>
            ) : (
              <>
                <MovieCarousel title="Mis Favoritas" movies={favoriteMovies} />
                <MovieCarousel title="Películas Vistas" movies={watchedMovies} />
                {favoriteMovies.length === 0 && watchedMovies.length === 0 && (
                  <p>Aún no has marcado películas. ¡Ve a la página de una película e interactúa!</p>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ProfilePage;