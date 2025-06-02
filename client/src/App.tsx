import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CompressImage from "@/pages/CompressImage";
import ResizeImage from "@/pages/ResizeImage";
import CropImage from "@/pages/CropImage";
import ConvertToJpg from "@/pages/ConvertToJpg";
import PhotoEditor from "@/pages/PhotoEditor";
import Premium from "@/pages/Premium";
import Subscribe from "@/pages/Subscribe";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/compress-image" element={<CompressImage />} />
          <Route path="/resize-image" element={<ResizeImage />} />
          <Route path="/crop-image" element={<CropImage />} />
          <Route path="/convert-to-jpg" element={<ConvertToJpg />} />
          <Route path="/photo-editor" element={<PhotoEditor />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/logout" element={<Navigate to="/" replace />} />
          <Route path="/sign-out" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;