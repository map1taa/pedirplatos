import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  name: z.string().min(1, "商品名は必須です"),
  price: z.string().min(1, "価格は必須です").regex(/^\d+(\.\d{1,2})?$/, "有効な価格を入力してください"),
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
      price: "",
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
      <CardHeader className="pb-4">
        <CardTitle className="font-bold text-slate-900 flex items-center">
          <PlusCircle className="mr-1 text-brand-blue h-4 w-4" />
          新しいお皿を追加
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Upload */}
            <div className="md:col-span-2">
              <FormLabel className="block font-semibold text-slate-700 mb-2">
                商品画像
              </FormLabel>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-brand-blue transition-colors">
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
                      画像を削除
                    </Button>
                  </div>
                ) : (
                  <>
                    <CloudUpload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
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
                  <Button type="button" asChild size="sm" className="cursor-pointer">
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
                  <FormLabel className="font-semibold text-slate-700">商品名</FormLabel>
                  <FormControl>
                    <Input placeholder="例：和風陶器プレート" className="h-8" {...field} />
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
                  <FormLabel className="font-semibold text-slate-700">価格（円）</FormLabel>
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
                {createDishMutation.isPending ? "追加中..." : "お皿を追加"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}