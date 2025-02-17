import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Download } from "lucide-react";
import { LineItem, Invoice, BusinessDetails, ClientInfo } from "@/types/invoice";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

const initialInvoice: Invoice = {
  id: crypto.randomUUID(),
  date: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  invoiceNumber: `INV-${Date.now()}`,
  businessDetails: {
    name: "",
    address: "",
    email: "",
    phone: "",
  },
  clientInfo: {
    name: "",
    email: "",
    address: "",
    phone: "",
  },
  lineItems: [],
  subtotal: 0,
  tax: 0,
  total: 0,
};

export const InvoiceForm = () => {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const { toast } = useToast();

  const updateBusinessDetails = (field: keyof BusinessDetails, value: string) => {
    setInvoice((prev) => ({
      ...prev,
      businessDetails: {
        ...prev.businessDetails,
        [field]: value,
      },
    }));
  };

  const updateClientInfo = (field: keyof ClientInfo, value: string) => {
    setInvoice((prev) => ({
      ...prev,
      clientInfo: {
        ...prev.clientInfo,
        [field]: value,
      },
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };

    setInvoice((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoice((prev) => {
      const updatedItems = prev.lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
          }
          return updatedItem;
        }
        return item;
      });

      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.1; // 10% tax rate
      const total = subtotal + tax;

      return {
        ...prev,
        lineItems: updatedItems,
        subtotal,
        tax,
        total,
      };
    });
  };

  const removeLineItem = (id: string) => {
    setInvoice((prev) => {
      const updatedItems = prev.lineItems.filter((item) => item.id !== id);
      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      return {
        ...prev,
        lineItems: updatedItems,
        subtotal,
        tax,
        total,
      };
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add business details
    doc.setFontSize(20);
    doc.text("INVOICE", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
    doc.text(`Date: ${invoice.date}`, 14, 37);
    doc.text(`Due Date: ${invoice.dueDate}`, 14, 44);

    // Business details
    doc.setFontSize(14);
    doc.text("From:", 14, 60);
    doc.setFontSize(12);
    doc.text([
      invoice.businessDetails.name,
      invoice.businessDetails.address,
      invoice.businessDetails.email,
      invoice.businessDetails.phone
    ], 14, 70);

    // Client details
    doc.setFontSize(14);
    doc.text("Bill To:", 14, 100);
    doc.setFontSize(12);
    doc.text([
      invoice.clientInfo.name,
      invoice.clientInfo.address,
      invoice.clientInfo.email,
      invoice.clientInfo.phone
    ], 14, 110);

    // Line items table
    const tableData = invoice.lineItems.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.rate.toFixed(2)}`,
      `$${item.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 140,
      head: [["Description", "Quantity", "Rate", "Amount"]],
      body: tableData,
    });

    // Calculate the Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Add totals
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, pageWidth - 60, finalY + 10);
    doc.text(`Tax (10%): $${invoice.tax.toFixed(2)}`, pageWidth - 60, finalY + 20);
    doc.setFontSize(14);
    doc.text(`Total: $${invoice.total.toFixed(2)}`, pageWidth - 60, finalY + 30);

    // Save PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
    
    toast({
      title: "Success",
      description: "Invoice PDF has been generated",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save invoice logic here
    toast({
      title: "Success",
      description: "Invoice has been saved",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <Card className="p-6 glass">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Business Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={invoice.businessDetails.name}
                onChange={(e) => updateBusinessDetails("name", e.target.value)}
                className="transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-email">Email</Label>
              <Input
                id="business-email"
                type="email"
                value={invoice.businessDetails.email}
                onChange={(e) => updateBusinessDetails("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-address">Address</Label>
              <Input
                id="business-address"
                value={invoice.businessDetails.address}
                onChange={(e) => updateBusinessDetails("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-phone">Phone</Label>
              <Input
                id="business-phone"
                value={invoice.businessDetails.phone}
                onChange={(e) => updateBusinessDetails("phone", e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 glass">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                value={invoice.clientInfo.name}
                onChange={(e) => updateClientInfo("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={invoice.clientInfo.email}
                onChange={(e) => updateClientInfo("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-address">Address</Label>
              <Input
                id="client-address"
                value={invoice.clientInfo.address}
                onChange={(e) => updateClientInfo("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                value={invoice.clientInfo.phone}
                onChange={(e) => updateClientInfo("phone", e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 glass">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Line Items</h2>
            <Button
              type="button"
              onClick={addLineItem}
              className="flex items-center space-x-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </Button>
          </div>

          <div className="space-y-4">
            {invoice.lineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Rate</Label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateLineItem(item.id, "rate", e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Label>Amount</Label>
                  <Input value={item.amount.toFixed(2)} disabled />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeLineItem(item.id)}
                    className="text-destructive hover:text-destructive/90 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-end space-y-2 pt-4 border-t">
            <div className="flex space-x-4">
              <span className="font-semibold">Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex space-x-4">
              <span className="font-semibold">Tax (10%):</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
            <div className="flex space-x-4 text-lg font-bold">
              <span>Total:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={generatePDF}
          className="px-6 py-2 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button
          type="submit"
          className="px-6 py-2 transition-all hover:scale-105"
        >
          Save Invoice
        </Button>
      </div>
    </form>
  );
};
