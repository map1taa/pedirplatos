import { useState } from "react";
import { ShoppingCartIcon, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Dish } from "@shared/schema";

interface ProductGridProps {
  dishes: Dish[];
  isLoading: boolean;
}

export default function ProductGrid({ dishes, isLoading }: ProductGridProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart } = useCart();
  const { toast } = useToast();

  const getQuantity = (dishId: string) => quantities[dishId] || 0;

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity < 0) quantity = 0;
    if (quantity > 99) quantity = 99;
    setQuantities(prev => ({ ...prev, [dishId]: quantity }));
  };

  const handleAddToCart = (dish: Dish) => {
    const quantity = getQuantity(dish.id);
    if (quantity <= 0) {
      toast({
        title: "数量を選択してください",
        description: "カートに追加するには1個以上を選択してください。",
        variant: "destructive",
      });
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(dish);
    }
    toast({
      title: "カートに追加しました",
      description: `${dish.name} × ${quantity}個をカートに追加しました。`,
    });
    setQuantities(prev => ({ ...prev, [dish.id]: 0 }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left">画像</th>
                <th className="px-3 py-2 text-left">商品名</th>
                <th className="px-3 py-2 text-right">価格</th>
                <th className="px-3 py-2 text-center">数量</th>
                <th className="px-3 py-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-3 py-2">
                    <Skeleton className="w-12 h-12 rounded" />
                  </td>
                  <td className="px-3 py-2">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-3 py-2">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </td>
                  <td className="px-3 py-2">
                    <Skeleton className="h-6 w-20 mx-auto" />
                  </td>
                  <td className="px-3 py-2">
                    <Skeleton className="h-6 w-12 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-slate-900">商品一覧</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">画像</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">商品名</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-700">価格</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700">数量</th>
              <th className="px-3 py-2 text-center font-semibold text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish) => (
              <tr key={dish.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <img
                      src={dish.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=48&h=48"}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="font-medium text-slate-900">{dish.name}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="font-bold text-brand-blue">
                    ¥{parseFloat(dish.price).toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0"
                      onClick={() => updateQuantity(dish.id, getQuantity(dish.id) - 1)}
                    >
                      <Minus className="h-2 w-2" />
                    </Button>
                    <Input
                      type="number"
                      value={getQuantity(dish.id)}
                      onChange={(e) => updateQuantity(dish.id, parseInt(e.target.value) || 0)}
                      className="w-12 h-6 text-center p-1"
                      min="0"
                      max="99"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0"
                      onClick={() => updateQuantity(dish.id, getQuantity(dish.id) + 1)}
                    >
                      <Plus className="h-2 w-2" />
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Button 
                    size="sm"
                    className="bg-brand-blue hover:bg-blue-700 px-3 py-1"
                    onClick={() => handleAddToCart(dish)}
                  >
                    <ShoppingCartIcon className="mr-1 h-3 w-3" />
                    追加
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dishes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-600">商品がありません。</p>
        </div>
      )}
    </div>
  );
}