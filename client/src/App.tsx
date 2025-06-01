import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/Home";
import CompressImage from "./pages/CompressImage";
import ResizeImage from "./pages/ResizeImage";
import CropImage from "./pages/CropImage";
import ConvertToJpg from "./pages/ConvertToJpg";
import PhotoEditor from "./pages/PhotoEditor";
import Premium from "./pages/Premium";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/not-found";
import Subscribe from "./pages/Subscribe";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/compress" component={CompressImage} />
        <Route path="/resize" component={ResizeImage} />
        <Route path="/crop" component={CropImage} />
        <Route path="/convert-to-jpg" component={ConvertToJpg} />
        <Route path="/photo-editor" component={PhotoEditor} />
        <Route path="/premium" component={Premium} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/subscribe" component={Subscribe} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;