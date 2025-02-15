import ThemeProvider from './theme/ThemeProvider';
// import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Login from './pages/Login/Login'
import PatientList from './pages/PatientList/PatientList';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';

const App = () => {
  return (
    <div>
      <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/patientList" element={<PatientList />}/>
      </Routes>
      </ThemeProvider>
    </div>
  )
}

export default App
