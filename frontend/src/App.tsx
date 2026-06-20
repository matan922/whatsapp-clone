import { Route, Routes } from "react-router"
import LoginPage from "./pages/authentication/LoginPage"
import RegisterPage from "./pages/authentication/RegisterPage"
import MainPage from "./pages/main/MainPage"
import SSOCallbackPage from "./pages/authentication/SSOCallbackPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sso-callback" element={<SSOCallbackPage />} />
      <Route path="/main" element={<MainPage />} />
    </Routes>
  )
}

export default App
