import { useState } from "react";
import { Grid, List, ShoppingCartIcon } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-10 w-full" />
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
        <div className="flex items-center space-x-4">
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
          
          <div className="flex bg-white border border-slate-300 rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="border-r border-slate-300"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className={
        viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }>
        {filteredDishes.map((dish) => (
          <Card key={dish.id} className="overflow-hidden hover:shadow-md transition-shadow">
            {viewMode === "grid" ? (
              <>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={dish.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                    alt={dish.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">{dish.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-brand-blue">
                      ¥{parseFloat(dish.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {dish.size}
                    </span>
                  </div>
                  <Button 
                    className="w-full bg-brand-blue hover:bg-blue-700"
                    onClick={() => handleAddToCart(dish)}
                  >
                    <ShoppingCartIcon className="mr-2 h-4 w-4" />
                    カートに追加
                  </Button>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={dish.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{dish.name}</h3>
                  {dish.description && (
                    <p className="text-sm text-slate-600 mt-1 truncate">{dish.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-lg font-bold text-brand-blue">
                      ¥{parseFloat(dish.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {dish.size}
                    </span>
                  </div>
                </div>
                <Button 
                  className="bg-brand-blue hover:bg-blue-700"
                  onClick={() => handleAddToCart(dish)}
                >
                  <ShoppingCartIcon className="mr-2 h-4 w-4" />
                  カートに追加
                </Button>
              </CardContent>
            )}
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
