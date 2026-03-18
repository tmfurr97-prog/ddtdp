import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DeconstructLab from "./pages/DeconstructLab";
import VerificationToolkit from "./pages/VerificationToolkit";
import EmailScanner from "./pages/EmailScanner";
import VideoAnalyzer from "./pages/VideoAnalyzer";
import SoberUp from "./pages/SoberUp";
import TrainUp from "./pages/TrainUp";
import Premium from "./pages/Premium";
import Partners from "./pages/Partners";
import Donate from "./pages/Donate";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/lab" component={DeconstructLab} />
      <Route path="/toolkit" component={VerificationToolkit} />
      <Route path="/toolkit/email" component={EmailScanner} />
      <Route path="/toolkit/video" component={VideoAnalyzer} />
      <Route path="/sober-up" component={SoberUp} />
      <Route path="/train-up" component={TrainUp} />
      <Route path="/premium" component={Premium} />
      <Route path="/partners" component={Partners} />
      <Route path="/donate" component={Donate} />
      <Route path="/profile" component={Profile} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Layout>
            <Router />
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
