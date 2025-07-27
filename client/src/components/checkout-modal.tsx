import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardCheck, Check, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  customerName: z.string().min(1, "Ingrese el nombre del responsable"),
  customerEmail: z.string().email("Ingrese una dirección de correo válida").min(1, "Ingrese su dirección de correo"),
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
    },
  });

  const subtotal = getCartSubtotal();
  const total = subtotal;

  const createOrderMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const orderData = {
        order: {
          ...data,
          customerPhone: "",
          customerAddress: "",
          notes: "",
          paymentMethod: "bank",
          subtotal: subtotal.toString(),
          shipping: "0",
          tax: "0",
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
        title: "Pedido completado",
        description: "El contenido del pedido se envió por correo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error al procesar el pedido.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createOrderMutation.mutate(data);
  };

  return (
    <>
      {/* Checkout Modal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-3">
            <DialogTitle className="font-bold text-slate-900 flex items-center">
              <ClipboardCheck className="mr-1 text-brand-blue h-4 w-4" />
              Confirmación de Pedido
            </DialogTitle>
            <DialogDescription>
              Ingrese los datos necesarios para confirmar el pedido.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-slate-50 rounded-lg p-3">
              <h3 className="font-semibold text-slate-900 mb-2">Contenido del Pedido</h3>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.dish.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-slate-900">{item.dish.name}</span>
                      <span className="text-slate-600 ml-2">×{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-brand-blue">
                      ¥{(parseFloat(item.dish.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="border-t border-slate-300 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-brand-blue">¥{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Nombre del Responsable</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Dirección de Correo</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="juan@empresa.com" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2 pt-2">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm"
                    className="flex-1 h-8" 
                    onClick={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm"
                    className="flex-1 bg-brand-blue hover:bg-orange-700 h-8"
                    disabled={createOrderMutation.isPending}
                  >
                    <NotebookPen className="mr-1 h-3 w-3" />
                    {createOrderMutation.isPending ? "Procesando..." : "Realizar Pedido"}
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
          <DialogHeader>
            <DialogTitle className="sr-only">Pedido Completado</DialogTitle>
            <DialogDescription>
              El pedido se completó exitosamente.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 mb-1">Pedido Completado</h2>
              <p className="text-slate-600">
                El contenido del pedido se envió a la dirección de correo especificada.
              </p>
            </div>
            <Button 
              onClick={() => setIsConfirmationOpen(false)}
              className="w-full bg-brand-blue hover:bg-orange-700 h-8"
              size="sm"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}