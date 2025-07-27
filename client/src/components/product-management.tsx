import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, CloudUpload, Trash2, Eye, EyeOff, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Dish } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "商品名は必須です"),
  price: z.string().min(1, "価格は必須です").regex(/^\d+(\.\d{1,2})?$/, "有効な価格を入力してください"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProductManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [activeTab, setActiveTab] = useState("add");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dishes for the product list
  const { data: dishes = [], isLoading } = useQuery<Dish[]>({
    queryKey: ["/api/dishes"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
    },
  });

  // Reset form when editingDish changes
  useEffect(() => {
    if (editingDish) {
      form.reset({
        name: editingDish.name,
        price: editingDish.price,
      });
    } else {
      form.reset({
        name: "",
        price: "",
      });
    }
  }, [editingDish, form]);

  const createDishMutation = useMutation({
    mutationFn: async (data: FormValues & { image?: File }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'image' && value) {
          formData.append(key, value);
        }
      });
      if (data.image) {
        formData.append('image', data.image);
      }

      if (editingDish) {
        return apiRequest("PATCH", `/api/dishes/${editingDish.id}`, formData);
      } else {
        return apiRequest("POST", "/api/dishes", formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: editingDish ? "商品を更新しました" : "商品を追加しました",
        description: editingDish ? "商品が正常に更新されました。" : "新しい商品が正常に追加されました。",
      });
      handleCancelEdit();
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: editingDish ? "商品の更新に失敗しました。" : "商品の追加に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const deleteDishesMutation = useMutation({
    mutationFn: async (dishIds: string[]) => {
      await Promise.all(
        dishIds.map(id => apiRequest("DELETE", `/api/dishes/${id}`))
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      const deletedCount = variables.length;
      setSelectedDishes(new Set());
      toast({
        title: "商品を削除しました",
        description: `${deletedCount}個の商品を削除しました。`,
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "商品の削除に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      toast({
        title: "エラー",
        description: "画像ファイルを選択してください。",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const onSubmit = (data: FormValues) => {
    createDishMutation.mutate({
      ...data,
      image: selectedFile || undefined,
    });
  };

  const handleSelectDish = (dishId: string, checked: boolean) => {
    setSelectedDishes(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(dishId);
      } else {
        newSet.delete(dishId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDishes(new Set(dishes.map(dish => dish.id)));
    } else {
      setSelectedDishes(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (selectedDishes.size === 0) return;
    if (confirm(`${selectedDishes.size}個の商品を削除しますか？`)) {
      deleteDishesMutation.mutate(Array.from(selectedDishes));
    }
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    if (dish.imageUrl) {
      setPreviewUrl(dish.imageUrl);
    } else {
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setActiveTab("add"); // Switch to add/edit tab
  };

  const handleCancelEdit = () => {
    setEditingDish(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="add" className="text-xs">
          {editingDish ? "Editar Producto" : "Agregar Producto"}
        </TabsTrigger>
        <TabsTrigger value="list" className="text-xs">Lista de Productos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="add" className="mt-3">
        <Card className="border border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="font-bold text-slate-900 flex items-center">
                {editingDish ? (
                  <>
                    <Edit className="mr-1 text-brand-blue h-4 w-4" />
                    Editar Producto
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-1 text-brand-blue h-4 w-4" />
                    Agregar Nuevo Plato
                  </>
                )}
              </CardTitle>
              {editingDish && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div className="md:col-span-2">
                  <FormLabel className="block font-semibold text-slate-700 mb-2">
                    Imagen del Producto
                  </FormLabel>
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-brand-blue transition-colors"
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {previewUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="mx-auto max-h-32 rounded-lg object-cover"
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          Eliminar Imagen
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CloudUpload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-slate-600 mb-2">
                          Arrastre y suelte la imagen o haga clic para seleccionar
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button type="button" asChild size="sm" className="cursor-pointer">
                        <span>Seleccionar Archivo</span>
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Product Details */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Nombre del Producto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Plato de Cerámica Japonesa" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Precio (¥)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2500" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={createDishMutation.isPending}
                    className="w-full bg-brand-blue hover:bg-blue-700"
                  >
                    {createDishMutation.isPending 
                      ? (editingDish ? "Actualizando..." : "Agregando...") 
                      : (editingDish ? "Actualizar Producto" : "Agregar Plato")
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="list" className="mt-3">
        <Card className="border border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="font-bold text-slate-900 flex items-center">
                <Eye className="mr-1 text-brand-blue h-4 w-4" />
                Lista de Productos ({dishes.length})
              </CardTitle>
              {selectedDishes.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={deleteDishesMutation.isPending}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Eliminar Seleccionados ({selectedDishes.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-slate-600">Cargando...</p>
              </div>
            ) : dishes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No hay productos registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header row with select all */}
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded text-xs font-medium">
                  <Checkbox
                    checked={selectedDishes.size === dishes.length && dishes.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <div className="w-12">Imagen</div>
                  <div className="flex-1">Nombre del Producto</div>
                  <div className="w-20 text-right">Precio</div>
                  <div className="w-16 text-center">Editar</div>
                </div>
                
                {/* Product rows */}
                {dishes.map(dish => (
                  <div key={dish.id} className="flex items-center gap-3 p-2 border border-slate-200 rounded hover:bg-slate-50">
                    <Checkbox
                      checked={selectedDishes.has(dish.id)}
                      onCheckedChange={(checked) => handleSelectDish(dish.id, checked as boolean)}
                    />
                    <div className="w-12 h-12 flex-shrink-0">
                      {dish.imageUrl ? (
                        <img 
                          src={dish.imageUrl} 
                          alt={dish.name}
                          className="w-full h-full object-cover rounded border"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 rounded border flex items-center justify-center">
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{dish.name}</p>
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-medium text-slate-900">¥{parseInt(dish.price).toLocaleString()}</span>
                    </div>
                    <div className="w-16 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDish(dish)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}