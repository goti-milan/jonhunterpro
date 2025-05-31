import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import JobDetails from "@/pages/JobDetails";
import PostJob from "@/pages/PostJob";
import Profile from "@/pages/Profile";
import AIBuilder from "@/pages/AIBuilder";
import ATSAnalyzer from "@/pages/ATSAnalyzer";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/jobs/:id" component={JobDetails} />
          <Route path="/post-job" component={PostJob} />
          <Route path="/profile" component={Profile} />
          <Route path="/ai-builder" component={AIBuilder} />
          <Route path="/ats-analyzer" component={ATSAnalyzer} />
        </>
      )}
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
