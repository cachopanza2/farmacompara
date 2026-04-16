/*
 * FarmaCompara Paraguay — App Router
 * Diseño: Clínico Moderno | Azul profundo + Verde esmeralda
 * Rutas: / | /buscar | /resultados | /producto/:id | /farmacias | /admin
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Buscar from "./pages/Buscar";
import Resultados from "./pages/Resultados";
import Producto from "./pages/Producto";
import Farmacias from "./pages/Farmacias";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/buscar" component={Buscar} />
      <Route path="/resultados" component={Resultados} />
      <Route path="/producto/:id" component={Producto} />
      <Route path="/farmacias" component={Farmacias} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
