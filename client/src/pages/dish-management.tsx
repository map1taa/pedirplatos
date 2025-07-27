import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Edit, Trash2, Upload } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Dish, Category } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DishManagement() {
  const { toast } = useToast();
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [dishForm, setDishForm] = useState({ name: "", price: "", image: null as File | null });
  const [categoryForm, setCategoryForm] = useState({ name: "", sortOrder: "0", doorImage: null as File | null });

  const { data: dishes = [], isLoading: dishesLoading } = useQuery<Dish[]>({
    queryKey: ["/api/dishes"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createDishMutation = useMutation({
    mutationFn: async (data: { name: string; price: string; categoryId: string | null; image?: File }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price);
      if (data.categoryId) formData.append("categoryId", data.categoryId);
      if (data.image) formData.append("image", data.image);
      
      if (editingDish) {
        return apiRequest("PATCH", `/api/dishes/${editingDish.id}`, formData);
      }
      return apiRequest("POST", "/api/dishes", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: editingDish ? "商品を更新しました" : "商品を追加しました",
        description: editingDish ? "商品が正常に更新されました。" : "新しい商品が正常に追加されました。",
      });
      setIsAddDishOpen(false);
      setEditingDish(null);
      setDishForm({ name: "", price: "", image: null });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "操作に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const deleteDishMutation = useMutation({
    mutationFn: async (dishId: string) => {
      return apiRequest("DELETE", `/api/dishes/${dishId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: "商品を削除しました",
        description: "商品が正常に削除されました。",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; sortOrder: number; doorImage?: File }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("sortOrder", data.sortOrder.toString());
      if (data.doorImage) formData.append("doorImage", data.doorImage);
      
      if (editingCategory) {
        return apiRequest("PATCH", `/api/categories/${editingCategory.id}`, formData);
      }
      return apiRequest("POST", "/api/categories", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: editingCategory ? "カテゴリを更新しました" : "カテゴリを作成しました",
        description: editingCategory ? "カテゴリが正常に更新されました。" : "カテゴリが正常に作成されました。",
      });
      setIsAddCategoryOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", sortOrder: "0", doorImage: null });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "カテゴリを削除しました",
        description: "カテゴリが正常に削除されました。",
      });
    },
  });

  const handleAddDish = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setIsAddDishOpen(true);
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishForm({ name: dish.name, price: dish.price, image: null });
    setSelectedCategoryId(dish.categoryId);
    setIsAddDishOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, sortOrder: category.sortOrder?.toString() || "0", doorImage: null });
    setIsAddCategoryOpen(true);
  };

  const handleDishSubmit = () => {
    createDishMutation.mutate({
      name: dishForm.name,
      price: dishForm.price,
      categoryId: selectedCategoryId,
      image: dishForm.image || undefined,
    });
  };

  const handleCategorySubmit = () => {
    createCategoryMutation.mutate({
      name: categoryForm.name,
      sortOrder: parseInt(categoryForm.sortOrder),
      doorImage: categoryForm.doorImage || undefined,
    });
  };

  // Group dishes by category
  const uncategorizedDishes = dishes.filter(dish => !dish.categoryId);
  const dishesByCategory = dishes.reduce((acc, dish) => {
    if (dish.categoryId) {
      if (!acc[dish.categoryId]) acc[dish.categoryId] = [];
      acc[dish.categoryId].push(dish);
    }
    return acc;
  }, {} as Record<string, Dish[]>);

  const sortedCategories = categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  戻る
                </Button>
              </Link>
              <h1 className="font-bold text-brand-blue">商品管理</h1>
            </div>
            <Button 
              size="sm" 
              onClick={() => setIsAddCategoryOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="mr-1 h-3 w-3" />
              カテゴリ追加
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-full mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Uncategorized dishes */}
          {uncategorizedDishes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800">カテゴリなし</h2>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAddDish(null)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  商品追加
                </Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">画像</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">商品名</th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-700">価格</th>
                      <th className="px-3 py-2 text-center font-semibold text-slate-700">アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uncategorizedDishes.map((dish) => (
                      <tr key={dish.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <div className="w-12 h-12 rounded overflow-hidden">
                            <img
                              src={dish.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96"}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-medium text-slate-900">{dish.name}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="font-bold text-orange-600">¥{parseFloat(dish.price).toLocaleString()}</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditDish(dish)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteDishMutation.mutate(dish.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories with dishes */}
          {sortedCategories.map((category) => {
            const categoryDishes = dishesByCategory[category.id] || [];
            
            return (
              <div key={category.id} className="space-y-3">
                {/* Category header with door image */}
                <div className="relative">
                  <div 
                    className={`w-full h-48 rounded-lg overflow-hidden mb-2 relative group ${!category.doorImageUrl ? 'border-2 border-dashed border-slate-300' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-orange-500'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-orange-500'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-orange-500');
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        const formData = new FormData();
                        formData.append("name", category.name);
                        formData.append("sortOrder", category.sortOrder?.toString() || "0");
                        formData.append("doorImage", file);
                        createCategoryMutation.mutate({
                          name: category.name,
                          sortOrder: category.sortOrder || 0,
                          doorImage: file,
                        });
                        setEditingCategory(category);
                      }
                    }}
                  >
                    {category.doorImageUrl ? (
                      <>
                        <img
                          src={category.doorImageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm font-medium">画像をドロップして変更</p>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-600">画像をドロップ</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-slate-800">{category.name}</h2>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        編集
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        削除
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddDish(category.id)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        商品追加
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Dishes table */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-slate-700">画像</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-700">商品名</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-700">価格</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-700">アクション</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryDishes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                            このカテゴリには商品がありません
                          </td>
                        </tr>
                      ) : (
                        categoryDishes.map((dish) => (
                          <tr key={dish.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-2">
                              <div className="w-12 h-12 rounded overflow-hidden">
                                <img
                                  src={dish.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96"}
                                  alt={dish.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <span className="font-medium text-slate-900">{dish.name}</span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="font-bold text-orange-600">¥{parseFloat(dish.price).toLocaleString()}</span>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditDish(dish)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => deleteDishMutation.mutate(dish.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add/Edit Dish Dialog */}
      <Dialog open={isAddDishOpen} onOpenChange={setIsAddDishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDish ? "商品編集" : "商品追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dish-name">商品名</Label>
              <Input
                id="dish-name"
                value={dishForm.name}
                onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                placeholder="例：日本の陶器皿"
              />
            </div>
            <div>
              <Label htmlFor="dish-price">価格 (¥)</Label>
              <Input
                id="dish-price"
                type="number"
                value={dishForm.price}
                onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                placeholder="2500"
              />
            </div>
            <div>
              <Label htmlFor="dish-image">商品画像</Label>
              <Input
                id="dish-image"
                type="file"
                accept="image/*"
                onChange={(e) => setDishForm({ ...dishForm, image: e.target.files?.[0] || null })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDishOpen(false)}>
                キャンセル
              </Button>
              <Button 
                onClick={handleDishSubmit}
                disabled={!dishForm.name || !dishForm.price}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {editingDish ? "更新" : "追加"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "カテゴリ編集" : "カテゴリ追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">カテゴリ名</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="例：和食器"
              />
            </div>
            <div>
              <Label htmlFor="category-order">表示順</Label>
              <Input
                id="category-order"
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="category-image">ドア画像</Label>
              <Input
                id="category-image"
                type="file"
                accept="image/*"
                onChange={(e) => setCategoryForm({ ...categoryForm, doorImage: e.target.files?.[0] || null })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                キャンセル
              </Button>
              <Button 
                onClick={handleCategorySubmit}
                disabled={!categoryForm.name}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {editingCategory ? "更新" : "追加"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}