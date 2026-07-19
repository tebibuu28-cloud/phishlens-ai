import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/shared/Layout"
import { Landing } from "@/pages/Landing"
import { Analyzer } from "@/pages/Analyzer"
import { Results } from "@/pages/Results"
import { About } from "@/pages/About"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="analyzer" element={<Analyzer />} />
          <Route path="results" element={<Results />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
