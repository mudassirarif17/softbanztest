import React from 'react'
import ThemeProvider from './theme/ThemeProvider';
// import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Login from './pages/Login'

const App = () => {
  return (
    <div>
      <ThemeProvider>
        <Login />
      </ThemeProvider>
    </div>
  )
}

export default App
