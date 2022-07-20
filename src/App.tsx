/* eslint-disable jsx-a11y/label-has-associated-control */
import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material';
import { Suspense } from 'react';
import { Home } from './pages/home';
import { Files } from './pages/files/files';
import { Loading } from './components/loading';

const theme = createTheme({
  typography: {
    fontFamily: 'Verdana',
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/files" element={<Suspense fallback={<Loading text="Loading..." />}><Files /></Suspense>} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}
