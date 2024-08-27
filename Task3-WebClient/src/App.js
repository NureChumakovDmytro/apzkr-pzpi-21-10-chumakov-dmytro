// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import MainSitePage from './components/MainSitePage';

import Login from './components/registration and login/Login';
import PaswordChange from './components/registration and login/PaswordChange';
import Register from './components/registration and login/Register';

import Flowers from './components/Flowers';
import FlowersEdit from './components/FlowersEdit';
import FlowersAdd from './components/FlowersAdd';

import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Removed Test route */}
          <Route path="/" element={<Login />} />  {/* Default route goes to Login */}
          <Route path="/main" element={<MainSitePage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/password-change" element={<PaswordChange />} />
          <Route path="/register" element={<Register />} />

          <Route path="/flowers" element={<Flowers />} />
          <Route path="/flowers/edit" element={<FlowersEdit />} />
          <Route path="/flowers/add" element={<FlowersAdd />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
