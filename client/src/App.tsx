import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import CompressImage from "@/pages/CompressImage";
import ResizeImage from "@/pages/ResizeImage";
import CropImage from "@/pages/CropImage";
import ConvertToJpg from "@/pages/ConvertToJpg";
import PhotoEditor from "@/pages/PhotoEditor";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Premium from "@/pages/Premium";
import Subscribe from "@/pages/Subscribe";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/home" component={Home} />
      <Route path="/compress-image" component={CompressImage} />
      <Route path="/resize-image" component={ResizeImage} />
      <Route path="/crop-image" component={CropImage} />
      <Route path="/convert-to-jpg" component={ConvertToJpg} />
      <Route path="/photo-editor" component={PhotoEditor} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/premium" component={Premium} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;