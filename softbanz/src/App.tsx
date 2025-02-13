import ThemeProvider from './theme/ThemeProvider';
// import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Login from './pages/Login/Login'
import { Route, Routes } from 'react-router-dom';
import PatientList from './pages/PatientList/PatientList';

const App = () => {
  return (
    <div>
      <ThemeProvider>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/" element={<PatientList />}/>
      </Routes>
      </ThemeProvider>
    </div>
  )
}

export default App
