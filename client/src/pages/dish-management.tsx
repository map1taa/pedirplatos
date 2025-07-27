import ProductManagement from "@/components/product-management";
import { ArrowLeft, Settings } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DishManagement() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-2">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Volver
                </Button>
              </Link>
              <h1 className="font-bold text-slate-900 flex items-center">
                <Settings className="mr-1 text-brand-blue h-4 w-4" />
                Gestión de Platos
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-4 py-4">
        <ProductManagement />
      </div>
    </div>
  );
}