import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Menu, Utensils, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ProductGrid from "@/components/product-grid";
import ShoppingCartSidebar from "@/components/shopping-cart";
import CheckoutModal from "@/components/checkout-modal";
import { useCart } from "@/hooks/use-cart";
import type { Dish } from "@shared/schema";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cartItems } = useCart();

  const { data: dishes = [], isLoading } = useQuery<Dish[]>({
    queryKey: ["/api/dishes"],
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center">
              <h1 className="font-bold text-brand-blue">
                <Utensils className="inline mr-1 h-4 w-4" />
                Pedidos de Vajilla
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-4">
              <Link href="/management">
                <Button variant="ghost" size="sm" className="text-slate-700 hover:text-brand-blue">
                  <Settings className="mr-1 h-3 w-3" />
                  Gestión
                </Button>
              </Link>
            </nav>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="relative px-2"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-amber text-white rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </Button>
              
              <Button variant="ghost" size="sm" className="md:hidden px-2">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-4 py-4">
        {/* Product Grid Section */}
        <section id="products">
          <ProductGrid dishes={dishes} isLoading={isLoading} />
        </section>
      </div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Cart Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
}
