import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./Components/Footer";
import Nav from "./Components/Navbar";
import About from "./Pages/About";
import Articles from "./Pages/Articles";
import Chatbot from "./Pages/Chatbot";
import Coursetest from "./Pages/Coursetest";
import Detection from "./Pages/Detection";
import Home from "./Pages/Home";
import Learning from "./Pages/Learning";
import Overalltest from "./Pages/Overalltest";
import TestDashboard from "./Pages/TestDashboard";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Nav />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/learning" element={<Learning />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/articles" element={<Articles />} />
                    <Route path="/detect/:number" element={<Detection />} />
                    <Route path="/overall" element={<Overalltest />} />
                    <Route path="/overalltest" element={<Overalltest />} />
                    <Route path="/dashboard" element={<TestDashboard />} />
                    <Route path="/course/:courseId" element={<Coursetest />} />
                    <Route path="/course" element={<Coursetest />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                </Routes>
                <Footer />
            </BrowserRouter>
        </ThemeProvider>
    );
}
