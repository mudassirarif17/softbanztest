import ThemeProvider from './theme/ThemeProvider';
// import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Login from './pages/Login/Login'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';

const App = () => {
  return (
    <div>
      <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
      </Routes>
      </ThemeProvider>
    </div>
  )
}

export default App
