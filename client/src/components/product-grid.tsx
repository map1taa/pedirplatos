import { useState } from "react";
import { ShoppingCartIcon, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Dish } from "@shared/schema";

interface ProductGridProps {
  dishes: Dish[];
  isLoading: boolean;
}

export default function ProductGrid({ dishes, isLoading }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart } = useCart();
  const { toast } = useToast();

  const categories = Array.from(new Set(dishes.map(dish => dish.category)));
  const filteredDishes = selectedCategory === "all" 
    ? dishes 
    : dishes.filter(dish => dish.category === selectedCategory);

  const getQuantity = (dishId: string) => quantities[dishId] || 1;

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    setQuantities(prev => ({ ...prev, [dishId]: quantity }));
  };

  const handleAddToCart = (dish: Dish) => {
    const quantity = getQuantity(dish.id);
    for (let i = 0; i < quantity; i++) {
      addToCart(dish);
    }
    toast({
      title: "カートに追加しました",
      description: `${dish.name} × ${quantity}個をカートに追加しました。`,
    });
    // リセットオプション: 追加後に数量を1に戻す
    setQuantities(prev => ({ ...prev, [dish.id]: 1 }));
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border border-slate-200">
              <CardContent className="p-6 flex items-center space-x-6">
                <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center space-x-6">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">商品一覧</h2>
        <div className="flex items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのカテゴリー</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {filteredDishes.map((dish) => (
          <Card key={dish.id} className="overflow-hidden hover:shadow-md transition-shadow border border-slate-200">
            <CardContent className="p-6 flex items-center space-x-6">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <img
                  src={dish.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&h=96"}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{dish.name}</h3>
                {dish.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{dish.description}</p>
                )}
                <div className="flex items-center space-x-6">
                  <span className="text-2xl font-bold text-brand-blue">
                    ¥{parseFloat(dish.price).toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">
                    {dish.size}
                  </span>
                  <span className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                    {dish.category}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center space-x-4">
                {/* 数量選択 */}
                <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => updateQuantity(dish.id, getQuantity(dish.id) - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={getQuantity(dish.id)}
                    onChange={(e) => updateQuantity(dish.id, parseInt(e.target.value) || 1)}
                    className="w-16 h-8 text-center text-sm"
                    min="1"
                    max="99"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => updateQuantity(dish.id, getQuantity(dish.id) + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* カートに追加ボタン */}
                <Button 
                  size="lg"
                  className="bg-brand-blue hover:bg-blue-700 px-6 py-3"
                  onClick={() => handleAddToCart(dish)}
                >
                  <ShoppingCartIcon className="mr-2 h-5 w-5" />
                  カートに追加
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">選択されたカテゴリーに商品がありません。</p>
        </div>
      )}
    </div>
  );
}
