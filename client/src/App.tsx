import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NgoPage from "@/pages/ngo-page";
import NgoDashboard from "@/pages/ngo-dashboard";
import NotFound from "@/pages/not-found";

// The Router component defines all the routes for the application
const Router = () => (
  <Switch>
    <Route path="/auth" component={AuthPage} />
    <Route path="/" component={HomePage} />
    <Route path="/ngo/:id">{(params) => <NgoPage id={params.id} />}</Route>
    {/* ProtectedRoute ensures that only authenticated users can access the dashboard */}
    <ProtectedRoute path="/dashboard" component={NgoDashboard} />
    <Route component={NotFound} />
  </Switch>
);

// The App component wraps the entire application in required providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* You can wrap Router with a Layout component here if needed */}
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

