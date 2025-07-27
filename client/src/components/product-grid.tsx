import { useState } from "react";
import { ShoppingCartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { addToCart } = useCart();
  const { toast } = useToast();

  const categories = Array.from(new Set(dishes.map(dish => dish.category)));
  const filteredDishes = selectedCategory === "all" 
    ? dishes 
    : dishes.filter(dish => dish.category === selectedCategory);

  const handleAddToCart = (dish: Dish) => {
    addToCart(dish);
    toast({
      title: "カートに追加しました",
      description: `${dish.name}をカートに追加しました。`,
    });
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
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4 flex items-center space-x-4">
                <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
                <Skeleton className="h-10 w-24" />
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
              <div className="flex-shrink-0">
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
