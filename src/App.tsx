import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material';
import { Home } from './pages/home';
import { InitClient } from './init-client';
import { Files } from './pages/files/files';

const theme = createTheme({
  typography: {
    fontFamily: 'Verdana',
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <InitClient>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/files" element={<Files />} />
          </Routes>
        </InitClient>
      </HashRouter>
    </ThemeProvider>
  );
}
