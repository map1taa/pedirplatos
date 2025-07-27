import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, ClipboardCheck, Check, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  customerName: z.string().min(1, "お名前は必須です"),
  customerEmail: z.string().email("有効なメールアドレスを入力してください"),
  customerPhone: z.string().min(1, "電話番号は必須です"),
  customerAddress: z.string().min(1, "配送先住所は必須です"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["credit", "bank", "cod"], {
    required_error: "支払い方法を選択してください",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const { cartItems, clearCart, getCartSubtotal, getCartTotal } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      notes: "",
      paymentMethod: "credit",
    },
  });

  const subtotal = getCartSubtotal();
  const shipping = 500;
  const tax = Math.round(subtotal * 0.1);
  const total = getCartTotal();

  const createOrderMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const orderData = {
        order: {
          ...data,
          subtotal: subtotal.toString(),
          shipping: shipping.toString(),
          tax: tax.toString(),
          total: total.toString(),
          status: "pending",
        },
        items: cartItems.map(item => ({
          dishId: item.dish.id,
          quantity: item.quantity,
          price: item.dish.price,
        })),
      };

      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      setOrderId(order.id);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onClose();
      setIsConfirmationOpen(true);
      toast({
        title: "注文が完了しました",
        description: "注文内容をメールで送信しました。",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "注文の処理に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createOrderMutation.mutate(data);
  };

  const paymentMethodLabels = {
    credit: "クレジットカード",
    bank: "銀行振込",
    cod: "代金引換",
  };

  return (
    <>
      {/* Checkout Modal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center">
              <ClipboardCheck className="mr-2 text-brand-blue" />
              注文確認
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">注文内容</h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.dish.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-slate-900">{item.dish.name}</span>
                      <span className="text-sm text-slate-600 ml-2">{item.dish.size}</span>
                      <span className="text-sm text-slate-600 ml-2">×{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-brand-blue">
                      ¥{(parseFloat(item.dish.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-slate-300 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">小計</span>
                    <span>¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">送料</span>
                    <span>¥{shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">税込</span>
                    <span>¥{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-slate-900">合計金額</span>
                    <span className="text-brand-blue">¥{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">お客様情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>お名前 *</FormLabel>
                          <FormControl>
                            <Input placeholder="田中太郎" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>電話番号 *</FormLabel>
                          <FormControl>
                            <Input placeholder="090-1234-5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>メールアドレス *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="example@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="customerAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>配送先住所 *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="〒123-4567 東京都渋谷区..."
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
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>備考</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="配送に関するご要望等"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">お支払い方法</h3>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="credit" id="credit" />
                              <Label htmlFor="credit">クレジットカード</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bank" id="bank" />
                              <Label htmlFor="bank">銀行振込</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cod" id="cod" />
                              <Label htmlFor="cod">代金引換</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                    キャンセル
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-brand-blue hover:bg-blue-700"
                    disabled={createOrderMutation.isPending}
                  >
                    <NotebookPen className="mr-2 h-4 w-4" />
                    {createOrderMutation.isPending ? "処理中..." : "注文を確定する"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Confirmation Modal */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">注文完了</h2>
              <p className="text-slate-600">
                ご注文ありがとうございます！<br />
                注文内容を指定のメールアドレスに送信しました。
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-slate-900 mb-2">注文番号</h3>
              <p className="font-mono text-brand-blue">#{orderId}</p>
            </div>
            <Button 
              className="w-full bg-brand-blue hover:bg-blue-700"
              onClick={() => setIsConfirmationOpen(false)}
            >
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
