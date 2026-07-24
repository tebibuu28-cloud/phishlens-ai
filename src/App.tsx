import { BrowserRouter, Routes, Route } from "react-router-dom"

import { Layout } from "@/components/shared/Layout"
import { AuthProvider } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"

import { Landing } from "@/pages/Landing"
import { Analyzer } from "@/pages/Analyzer"
import { Results } from "@/pages/Results"
import { About } from "@/pages/About"

import { Privacy } from "@/pages/Privacy"
import { Terms } from "@/pages/Terms"
import { Contact } from "@/pages/Contact"

import { Login } from "@/pages/Login"
import { Signup } from "@/pages/Signup"
import { Dashboard } from "@/pages/Dashboard"
import { AnalysisView } from "@/pages/AnalysisView"
import { NotFound } from "@/pages/NotFound"


function App() {

  return (

    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            {/* Main Website Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="analyzer" element={<Analyzer />} />
              <Route path="results" element={<Results />} />
              <Route path="about" element={<About />} />

              {/* User Pages */}
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="analysis/:id" element={<AnalysisView />} />

              {/* Footer Pages */}
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )

}


export default App