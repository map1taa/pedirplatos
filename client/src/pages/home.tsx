import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Menu, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductManagement from "@/components/product-management";
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-brand-blue">
                <Utensils className="inline mr-2" />
                お皿オーダー
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#products" className="text-slate-700 hover:text-brand-blue transition-colors font-medium">
                商品一覧
              </a>
              <a href="#management" className="text-slate-700 hover:text-brand-blue transition-colors font-medium">
                商品管理
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-amber text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </Button>
              
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Management Section */}
        <section id="management" className="mb-12">
          <ProductManagement />
        </section>

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
