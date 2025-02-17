
import { InvoiceForm } from "@/components/InvoiceForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            Professional Invoice Generator
          </h1>
          <p className="text-gray-600">Create beautiful, professional invoices in minutes</p>
        </header>
        <InvoiceForm />
      </div>
    </div>
  );
};

export default Index;
