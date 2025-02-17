import ThemeProvider from './theme/ThemeProvider';
// import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Login from './pages/Login/Login'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import PatientList from './pages/PatientList/index'

const App = () => {
  return (
    <div>
      <ThemeProvider>
      <Routes>
        <Route path="/" element={<PatientList title="Patients" desc="These are your Patients"/>}/>
        <Route path="/shared_patient" element={<PatientList title="Shared Patients" desc="These are your Patients"/>}/>
        <Route path="/login" element={<Login />}/>
      </Routes>
      </ThemeProvider>
    </div>
  )
}

export default App
