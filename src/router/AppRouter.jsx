import { Routes,Route } from "react-router-dom"
import { AuthRoutes } from "../auth/routes/AuthRoutes"
import { JournalRoutes } from "../journal/routes/JournalRoutes"

export const AppRouter = () => {
  return (
    <Routes> 
        {/* Login y Registro del Usuario */}
        <Route path="/auth/*" element={ <AuthRoutes /> }/>


        {/* Persona ya autenticada - panel de Trabajo */}
        <Route path="/*" element={ <JournalRoutes /> } />
    </Routes>
  )
}
