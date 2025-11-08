import React from 'react';
import { Outlet } from 'react-router-dom'; // 1. "Outlet" es el "hueco"
import Navbar from './components/Navbar.jsx'; // 2. Importamos la Navbar
import { Toaster } from 'react-hot-toast';


function App() {
  return (
 <div className="app-layout">
      
      {/* 2. AÑADE EL COMPONENTE (puedes ponerlo arriba) */}
      <Toaster 
        position="top-right" // La posición en la pantalla
        toastOptions={{
          // Estilos para que combine con tu modo oscuro
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <Navbar /> 
      <main className="content">
        <Outlet /> 
      </main>
    </div>
  );
}

export default App