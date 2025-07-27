import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  name: z.string().min(1, "商品名は必須です"),
  description: z.string().optional(),
  price: z.string().min(1, "価格は必須です").regex(/^\d+(\.\d{1,2})?$/, "有効な価格を入力してください"),
  size: z.string().min(1, "サイズは必須です"),
  category: z.string().min(1, "カテゴリーは必須です"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProductManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      size: "",
      category: "",
    },
  });

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

      return apiRequest("POST", "/api/dishes", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: "商品を追加しました",
        description: "新しい商品が正常に追加されました。",
      });
      form.reset();
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "商品の追加に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = (data: FormValues) => {
    createDishMutation.mutate({
      ...data,
      image: selectedFile || undefined,
    });
  };

  return (
    <Card className="border border-slate-200">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
          <PlusCircle className="mr-2 text-brand-blue" />
          新しいお皿を追加
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="md:col-span-2">
              <FormLabel className="block text-sm font-semibold text-slate-700 mb-2">
                商品画像
              </FormLabel>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-brand-blue transition-colors">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="mx-auto max-h-48 rounded-lg object-cover"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      画像を削除
                    </Button>
                  </div>
                ) : (
                  <>
                    <CloudUpload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-600 mb-2">
                      画像をドラッグ&ドロップまたはクリックして選択
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
                  <Button type="button" asChild className="cursor-pointer">
                    <span>ファイルを選択</span>
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
                  <FormLabel className="text-sm font-semibold text-slate-700">商品名</FormLabel>
                  <FormControl>
                    <Input placeholder="例：和風陶器プレート" {...field} />
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
                  <FormLabel className="text-sm font-semibold text-slate-700">価格（円）</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">サイズ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="サイズを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sサイズ (直径18cm)">Sサイズ (直径18cm)</SelectItem>
                      <SelectItem value="Mサイズ (直径22cm)">Mサイズ (直径22cm)</SelectItem>
                      <SelectItem value="Lサイズ (直径26cm)">Lサイズ (直径26cm)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">カテゴリー</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリーを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="和食器">和食器</SelectItem>
                      <SelectItem value="洋食器">洋食器</SelectItem>
                      <SelectItem value="デザート皿">デザート皿</SelectItem>
                      <SelectItem value="前菜皿">前菜皿</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">商品説明</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="商品の詳細説明を入力してください"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <Button 
                type="submit" 
                className="bg-brand-blue hover:bg-blue-700"
                disabled={createDishMutation.isPending}
              >
                {createDishMutation.isPending ? "追加中..." : "商品を追加"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
