import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Dish, Category } from "@shared/schema";

interface ProductGridProps {
  dishes: Dish[];
  isLoading: boolean;
}

export default function ProductGrid({ dishes, isLoading }: ProductGridProps) {
  // Fetch categories for door images
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart, updateQuantity: updateCartQuantity } = useCart();
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
        title: "Seleccione una cantidad",
        description: "Debe seleccionar 1 o más para añadir al carrito.",
        variant: "destructive",
      });
      return;
    }
    
    // Add dish to cart first, then update quantity
    addToCart(dish);
    updateCartQuantity(dish.id, quantity);
    
    toast({
      title: "Añadido al carrito",
      description: `${dish.name} × ${quantity} añadido al carrito.`,
    });
    setQuantities(prev => ({ ...prev, [dish.id]: 0 }));
  };

  // Group dishes by category
  const groupedDishes = dishes.reduce((acc, dish) => {
    const categoryId = dish.categoryId || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  // Chunk each category into groups of 8
  const createChunks = (dishes: Dish[], size: number) => {
    const chunks = [];
    for (let i = 0; i < dishes.length; i += size) {
      chunks.push(dishes.slice(i, i + size));
    }
    return chunks;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for category groups */}
        {Array.from({ length: 2 }).map((_, categoryIndex) => (
          <div key={categoryIndex} className="space-y-3">
            {/* Door image skeleton */}
            <div className="w-full">
              <Skeleton className="w-full h-32 rounded-lg" />
            </div>
            
            {/* Product table skeleton */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Imagen</th>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-right">Precio</th>
                    <th className="px-3 py-2 text-center">Cantidad</th>
                    <th className="px-3 py-2 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
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
        ))}
      </div>
    );
  }

  // Sort categories by sortOrder
  const sortedCategories = categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => {
        const categoryDishes = groupedDishes[category.id] || [];
        const dishChunks = createChunks(categoryDishes, 8);

        return dishChunks.map((dishChunk, chunkIndex) => (
          <div key={`${category.id}-${chunkIndex}`} className="space-y-3">
            {/* Door/Cover Image */}
            {category.doorImageUrl && (
              <div className="w-full">
                <img
                  src={category.doorImageUrl}
                  alt={`${category.name} - グループ ${chunkIndex + 1}`}
                  className="w-full h-64 object-cover rounded-lg shadow-sm"
                />
                <div className="text-center mt-2">
                  <h3 className="font-bold text-slate-800 text-sm">
                    {category.name} - グループ {chunkIndex + 1}
                  </h3>
                </div>
              </div>
            )}

            {/* Product Table for this chunk */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Imagen</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">Producto</th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-700">Precio</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-700">Cantidad</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-700">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {dishChunk.map((dish) => (
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
                        <span className="font-bold text-orange-600">
                          ¥{parseFloat(dish.price).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-6 h-6 p-0 hover:bg-orange-50 hover:border-orange-300"
                            onClick={() => updateQuantity(dish.id, getQuantity(dish.id) - 1)}
                          >
                            <Minus className="h-2 w-2" />
                          </Button>
                          <Input
                            type="number"
                            value={getQuantity(dish.id)}
                            onChange={(e) => updateQuantity(dish.id, parseInt(e.target.value) || 0)}
                            className="w-12 h-6 text-center p-1 border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                            min="0"
                            max="99"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-6 h-6 p-0 hover:bg-orange-50 hover:border-orange-300"
                            onClick={() => updateQuantity(dish.id, getQuantity(dish.id) + 1)}
                          >
                            <Plus className="h-2 w-2" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(dish)}
                          className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                        >
                          Añadir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ));
      })}

      {/* Show uncategorized dishes if any */}
      {groupedDishes.uncategorized && groupedDishes.uncategorized.length > 0 && (
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="font-bold text-slate-800 text-sm">Productos Sin Categoría</h3>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Imagen</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Nombre del Producto</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-700">Precio</th>
                  <th className="px-3 py-2 text-center font-semibold text-slate-700">Cantidad</th>
                  <th className="px-3 py-2 text-center font-semibold text-slate-700">Acción</th>
                </tr>
              </thead>
              <tbody>
                {groupedDishes.uncategorized.map((dish) => (
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
                      <span className="font-bold text-orange-600">
                        €{parseFloat(dish.price).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-6 h-6 p-0 hover:bg-orange-50 hover:border-orange-300"
                          onClick={() => updateQuantity(dish.id, getQuantity(dish.id) - 1)}
                        >
                          <Minus className="h-2 w-2" />
                        </Button>
                        <Input
                          type="number"
                          value={getQuantity(dish.id)}
                          onChange={(e) => updateQuantity(dish.id, parseInt(e.target.value) || 0)}
                          className="w-12 h-6 text-center p-1 border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                          min="0"
                          max="99"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-6 h-6 p-0 hover:bg-orange-50 hover:border-orange-300"
                          onClick={() => updateQuantity(dish.id, getQuantity(dish.id) + 1)}
                        >
                          <Plus className="h-2 w-2" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(dish)}
                        className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                      >
                        Añadir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}