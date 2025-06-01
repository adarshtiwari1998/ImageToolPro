import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import CompressImage from "@/pages/CompressImage";
import ResizeImage from "@/pages/ResizeImage";
import CropImage from "@/pages/CropImage";
import ConvertToJpg from "@/pages/ConvertToJpg";
import PhotoEditor from "@/pages/PhotoEditor";
import Premium from "@/pages/Premium";
import Subscribe from "@/pages/Subscribe";
import AdminDashboard from "@/pages/AdminDashboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/admin" component={AdminDashboard} />
        </>
      )}
      <Route path="/compress-image" component={CompressImage} />
      <Route path="/resize-image" component={ResizeImage} />
      <Route path="/crop-image" component={CropImage} />
      <Route path="/convert-to-jpg" component={ConvertToJpg} />
      <Route path="/photo-editor" component={PhotoEditor} />
      <Route path="/premium" component={Premium} />
      <Route path="/subscribe" component={Subscribe} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
