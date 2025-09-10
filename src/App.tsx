import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import PluginDetail from "./pages/PluginDetail";
import BundleDetail from "./pages/BundleDetail";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import OrderComplete from "./pages/OrderComplete";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import PolicyPage from "./pages/PolicyPage";
import MyDownloads from "./pages/MyDownloads";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/plugin/:id" element={<PluginDetail />} />
              <Route path="/bundle/:id" element={<BundleDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/checkout/bundle/:id" element={<Checkout />} />
              <Route path="/order-complete/:orderId" element={<OrderComplete />} />
              <Route path="/my-downloads" element={<MyDownloads />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/policies/:type" element={<PolicyPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
