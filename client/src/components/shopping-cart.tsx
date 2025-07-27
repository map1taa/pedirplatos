import { ShoppingCart, X, Minus, Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

interface ShoppingCartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function ShoppingCartSidebar({ isOpen, onClose, onCheckout }: ShoppingCartSidebarProps) {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartSubtotal } = useCart();

  const subtotal = getCartSubtotal();
  const shipping = 500;
  const tax = Math.round(subtotal * 0.1);
  const total = getCartTotal();

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-slate-200 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-900 flex items-center">
            <ShoppingCart className="mr-1 text-brand-blue h-4 w-4" />
            ショッピングカート
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-slate-600">カートは空です</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.dish.id} className="flex items-center space-x-3 pb-3 border-b border-slate-200">
                  <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.dish.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48"}
                      alt={item.dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{item.dish.name}</h3>
                    <p className="font-semibold text-brand-blue">
                      ¥{parseFloat(item.dish.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                      >
                        <Minus className="h-2 w-2" />
                      </Button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0"
                        onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                      >
                        <Plus className="h-2 w-2" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 px-1 py-0 h-5"
                      onClick={() => removeFromCart(item.dish.id)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-200 p-3 bg-slate-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-600">
                  小計 ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}点)
                </span>
                <span className="font-medium">¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">送料</span>
                <span className="font-medium">¥{shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">税込</span>
                <span className="font-medium">¥{tax.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-300 pt-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900">合計</span>
                  <span className="text-brand-blue">¥{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full bg-brand-blue hover:bg-blue-700 h-8"
                size="sm"
                onClick={onCheckout}
              >
                <CreditCard className="mr-1 h-3 w-3" />
                発注する
              </Button>
              <Button 
                variant="secondary" 
                className="w-full h-8"
                size="sm"
                onClick={onClose}
              >
                買い物を続ける
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
