import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Estilos globales
import './index.css';
import './App.css';
import './components/InteractionZone.css';
import './components/Navbar.css'; // Importamos el CSS de la Navbar
import './components/MovieCarousel.css'
import MovieDetailPage from './pages/MovieDetailPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './pages/ProfilePage.css';
import './components/StarRating.css';
import ProfilePage from './pages/ProfilePage.jsx';
// El Layout Principal (el "marco")
import App from './App.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
// Las páginas
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Esta es la estructura CORRECTA
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // El "marco" (Navbar)
    children: [
      
      // --- Rutas Públicas (Cualquiera puede verlas) ---
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      },

      // --- Rutas Privadas (Necesitas "Pase VIP") ---
      {
        path: '/', // Home
        element: (
          <ProtectedRoute> {/* <-- 3. EL GUARDIA VIGILA ESTA PUERTA */}
            <HomePage />
          </ProtectedRoute>
        )
      },
      {
        path: '/perfil', // Perfil
        element: (
          <ProtectedRoute> {/* <-- 4. EL GUARDIA VIGILA ESTA PUERTA */}
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: '/movie/:movieId', // <-- 2. AÑADE ESTA RUTA DINÁMICA
        element: <ProtectedRoute><MovieDetailPage /></ProtectedRoute>
      }
    ]
  }
]);

// Aquí React "enciende" la app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* <-- 3. ENVUELVE CON EL "PROVEEDOR" */}
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);