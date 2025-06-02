import { Router, Route, Switch, Redirect } from "wouter";
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
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/home" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/compress-image" component={CompressImage} />
          <Route path="/resize-image" component={ResizeImage} />
          <Route path="/crop-image" component={CropImage} />
          <Route path="/convert-to-jpg" component={ConvertToJpg} />
          <Route path="/photo-editor" component={PhotoEditor} />
          <Route path="/premium" component={Premium} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/logout">
            <Redirect to="/" />
          </Route>
          <Route path="/sign-out">
            <Redirect to="/" />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;