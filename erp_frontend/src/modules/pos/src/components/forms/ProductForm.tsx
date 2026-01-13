'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Product } from '@/lib/db/database';
import { ChevronRight, ChevronLeft, Check, Package, DollarSign, BarChart3, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const productSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  alternativeBarcodes: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),

  // Pricing
  costPrice: z.number().min(0, 'Cost price must be non-negative'),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
  wholesalePrice: z.number().optional(),
  taxable: z.boolean().default(true),
  taxRate: z.number().min(0).max(100).default(16.5),

  // Inventory
  stockQuantity: z.number().int('Stock must be an integer').min(0, 'Stock must be non-negative'),
  reorderLevel: z.number().int('Reorder level must be an integer').min(0, 'Reorder level must be non-negative'),
  reorderQuantity: z.number().int().min(0).optional(),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  packSize: z.number().optional(),

  // Supplier Info
  supplierName: z.string().optional(),
  supplierContact: z.string().optional(),
  supplierPrice: z.number().optional(),

  // Product Details
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
  manufacturingDate: z.string().optional(),
  location: z.string().optional(),
  shelfNumber: z.string().optional(),

  // Additional
  isPerishable: z.boolean().default(false),
  requiresPrescription: z.boolean().default(false),
  ageRestricted: z.boolean().default(false),
  minAge: z.number().optional(),
  notes: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  children: React.ReactNode;
}

type Step = 1 | 2 | 3 | 4;

export function ProductForm({ product, onSubmit, children }: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Currency converter state
  const [foreignAmount, setForeignAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    watch,
    setValue
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: product || {
      name: '',
      sku: '',
      barcode: '',
      alternativeBarcodes: '',
      category: '',
      subcategory: '',
      brand: '',
      description: '',
      costPrice: 0,
      sellingPrice: 0,
      wholesalePrice: 0,
      taxable: true,
      taxRate: 16.5,
      stockQuantity: 0,
      reorderLevel: 0,
      reorderQuantity: 0,
      unitOfMeasure: 'pieces',
      packSize: 1,
      supplierName: '',
      supplierContact: '',
      supplierPrice: 0,
      expiryDate: '',
      batchNumber: '',
      manufacturingDate: '',
      location: '',
      shelfNumber: '',
      isPerishable: false,
      requiresPrescription: false,
      ageRestricted: false,
      minAge: 0,
      notes: '',
    },
  });

  const isEditMode = !!product;

  // Watch values
  const costPrice = watch('costPrice');
  const sellingPrice = watch('sellingPrice');
  const isPerishable = watch('isPerishable');
  const ageRestricted = watch('ageRestricted');
  const taxable = watch('taxable');
  const packSize = watch('packSize');
  const stockQuantity = watch('stockQuantity');

  const taxRate = watch('taxRate') || 0;

  const netSellingPrice = useMemo(() => {
    if (!sellingPrice) return 0;
    if (taxable && taxRate > 0) {
      // Assuming selling price is tax-inclusive
      return sellingPrice / (1 + (taxRate / 100));
    }
    return sellingPrice;
  }, [sellingPrice, taxable, taxRate]);

  const profitMargin = netSellingPrice && costPrice
    ? ((netSellingPrice - costPrice) / netSellingPrice * 100).toFixed(1)
    : '0';

  const profitPerUnit = netSellingPrice && costPrice
    ? (netSellingPrice - costPrice).toFixed(2)
    : '0';

  const steps = [
    {
      number: 1,
      title: 'Basic Info',
      icon: Package,
      fields: ['name', 'sku', 'barcode', 'category', 'brand'] as const
    },
    {
      number: 2,
      title: 'Pricing & Tax',
      icon: DollarSign,
      fields: ['costPrice', 'sellingPrice', 'taxable', 'taxRate'] as const
    },
    {
      number: 3,
      title: 'Inventory',
      icon: BarChart3,
      fields: ['stockQuantity', 'unitOfMeasure', 'reorderLevel'] as const
    },
    {
      number: 4,
      title: 'Details',
      icon: Info,
      fields: ['supplierName', 'expiryDate', 'location'] as const
    },
  ];

  const validateStep = async (step: Step): Promise<boolean> => {
    const fields = steps[step - 1].fields;
    const result = await trigger(fields as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleFormSubmit = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      const data = getValues();
      onSubmit(data);
      setOpen(false);
      setCurrentStep(1);
    }
  };

  const getStepStatus = (step: Step): 'complete' | 'current' | 'upcoming' => {
    if (step < currentStep) return 'complete';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  // Common options
  const categories = [
    'Groceries', 'Beverages', 'Household', 'Personal Care',
    'Electronics', 'Clothing', 'Stationery', 'Pharmacy',
    'Dairy Products', 'Frozen Foods', 'Bakery', 'Meat & Poultry',
    'Fruits & Vegetables', 'Snacks', 'Other'
  ];

  const unitsOfMeasure = [
    'pieces', 'packs', 'kg', 'g', 'litres', 'ml',
    'dozen', 'boxes', 'cartons', 'bags', 'bottles', 'cans'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step.number as Step);
            const Icon = step.icon;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${status === 'complete'
                      ? 'bg-green-500 text-white'
                      : status === 'current'
                        ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-400'
                      }`}
                  >
                    {status === 'complete' ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1 font-medium ${status === 'current' ? 'text-blue-600' : 'text-gray-500'
                      }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-1 rounded transition-all ${status === 'complete' ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Coca Cola 500ml"
                  className="h-11"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('sku')}
                    placeholder="e.g., CC500ML"
                    className="h-11"
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Primary Barcode
                  </label>
                  <Input
                    {...register('barcode')}
                    placeholder="e.g., 123456789012"
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Alternative Barcodes
                </label>
                <Input
                  {...register('alternativeBarcodes')}
                  placeholder="Comma-separated (e.g., 111111, 222222)"
                  className="h-11"
                />
                <p className="text-xs text-gray-500 mt-1">For products with multiple barcodes</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category')}
                    className="w-full h-11 px-3 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Subcategory
                  </label>
                  <Input
                    {...register('subcategory')}
                    placeholder="e.g., Soft Drinks"
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Brand/Manufacturer
                </label>
                <Input
                  {...register('brand')}
                  placeholder="e.g., Coca Cola Company"
                  className="h-11"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Description
                </label>
                <Input
                  {...register('description')}
                  placeholder="Additional product details..."
                  className="h-11"
                />
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Tax */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Cost Price (Your Purchase Price) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-medium">K</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('costPrice', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="h-11 pl-8 text-lg"
                  />
                </div>
                {errors.costPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.costPrice.message}</p>
                )}
              </div>

              {/* Currency Converter Helper */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Currency Converter Helper</h4>
                </div>
                <p className="text-xs text-blue-700 mb-3">Convert foreign currency to Kwacha</p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Currency</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full h-9 px-2 border border-input bg-white rounded-md text-sm"
                    >
                      <option value="USD">$ USD</option>
                      <option value="GBP">£ GBP</option>
                      <option value="EUR">€ EUR</option>
                      <option value="ZAR">R ZAR</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Amount</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={foreignAmount}
                      onChange={(e) => setForeignAmount(e.target.value)}
                      placeholder="0.00"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Exchange Rate</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      placeholder="e.g., 1650"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {foreignAmount && exchangeRate && (
                  <div className="mt-3 pt-3 border-t border-blue-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Converted Amount:</span>
                      <span className="text-lg font-bold text-blue-900">
                        K {(parseFloat(foreignAmount) * parseFloat(exchangeRate)).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const converted = parseFloat(foreignAmount) * parseFloat(exchangeRate);
                        setValue('costPrice', parseFloat(converted.toFixed(2)));
                      }}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Use this amount as Cost Price
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Selling Price (Retail Price) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-medium">K</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('sellingPrice', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="h-11 pl-8 text-lg"
                  />
                </div>
                {errors.sellingPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.sellingPrice.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Wholesale Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 font-medium">K</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('wholesalePrice', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="h-11 pl-8"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">For bulk purchases</p>
              </div>

              {/* Profit Display */}
              {costPrice > 0 && sellingPrice > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Profit per Unit:</span>
                      <p className="text-xl font-bold text-green-700">K {profitPerUnit}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Profit Margin:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-lg px-3 py-1">
                        {profitMargin}%
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Tax Settings */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    {...register('taxable')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    This product is taxable (VAT)
                  </label>
                </div>

                {taxable && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Tax Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      {...register('taxRate', { valueAsNumber: true })}
                      placeholder="16.5"
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default VAT rate in Malawi is 16.5%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Inventory */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Initial Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    {...register('stockQuantity', { valueAsNumber: true })}
                    placeholder="0"
                    className="h-11 text-lg"
                  />
                  {errors.stockQuantity && (
                    <p className="text-red-500 text-xs mt-1">{errors.stockQuantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Unit of Measure <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('unitOfMeasure')}
                    className="w-full h-11 px-3 border border-input bg-background rounded-md text-sm"
                  >
                    {unitsOfMeasure.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  {errors.unitOfMeasure && (
                    <p className="text-red-500 text-xs mt-1">{errors.unitOfMeasure.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Pack Size
                </label>
                <Input
                  type="number"
                  {...register('packSize', { valueAsNumber: true })}
                  placeholder="1"
                  className="h-11"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many units in one pack? (e.g., 6 bottles in a pack)
                </p>
              </div>

              {packSize && packSize > 1 && stockQuantity > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    📦 Total Units: <strong>{stockQuantity * packSize}</strong> individual items ({stockQuantity} packs × {packSize})
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Reorder Level <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    {...register('reorderLevel', { valueAsNumber: true })}
                    placeholder="0"
                    className="h-11"
                  />
                  {errors.reorderLevel && (
                    <p className="text-red-500 text-xs mt-1">{errors.reorderLevel.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Alert when stock drops to this level</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Reorder Quantity
                  </label>
                  <Input
                    type="number"
                    {...register('reorderQuantity', { valueAsNumber: true })}
                    placeholder="0"
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500 mt-1">How much to order when restocking</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Storage Location
                  </label>
                  <Input
                    {...register('location')}
                    placeholder="e.g., Warehouse A"
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Shelf Number
                  </label>
                  <Input
                    {...register('shelfNumber')}
                    placeholder="e.g., A-12"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Product Flags */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('isPerishable')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Perishable Product (requires expiry date tracking)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('requiresPrescription')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Requires Prescription (for pharmacy items)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('ageRestricted')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Age Restricted Product
                  </label>
                </div>

                {ageRestricted && (
                  <div className="ml-7">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Minimum Age
                    </label>
                    <Input
                      type="number"
                      {...register('minAge', { valueAsNumber: true })}
                      placeholder="18"
                      className="h-11 w-32"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
              {/* Supplier Information */}
              <div className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Supplier Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Supplier Name
                    </label>
                    <Input
                      {...register('supplierName')}
                      placeholder="e.g., ABC Distributors"
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Supplier Contact
                      </label>
                      <Input
                        {...register('supplierContact')}
                        placeholder="Phone or email"
                        className="h-11"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Supplier Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500 font-medium">K</span>
                        <Input
                          type="number"
                          step="0.01"
                          {...register('supplierPrice', { valueAsNumber: true })}
                          placeholder="0.00"
                          className="h-11 pl-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Tracking */}
              <div className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Product Tracking</h3>
                <div className="space-y-3">
                  {isPerishable && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        {...register('expiryDate')}
                        className="h-11"
                      />
                      <p className="text-xs text-orange-600 mt-1">⚠️ Required for perishable products</p>
                    </div>
                  )}

                  {!isPerishable && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Expiry Date (Optional)
                      </label>
                      <Input
                        type="date"
                        {...register('expiryDate')}
                        className="h-11"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Batch Number
                      </label>
                      <Input
                        {...register('batchNumber')}
                        placeholder="e.g., BT-2024-001"
                        className="h-11"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Manufacturing Date
                      </label>
                      <Input
                        type="date"
                        {...register('manufacturingDate')}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Additional Notes
                </label>
                <textarea
                  {...register('notes')}
                  placeholder="Any special instructions, warnings, or additional information..."
                  className="w-full h-24 px-3 py-2 border border-input bg-background rounded-md text-sm"
                />
              </div>

              {/* Summary Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3">Product Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium truncate">{getValues('name') || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">SKU:</span>
                    <p className="font-medium truncate">{getValues('sku') || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium truncate">{getValues('category') || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Brand:</span>
                    <p className="font-medium truncate">{getValues('brand') || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Selling Price:</span>
                    <p className="font-medium">K {getValues('sellingPrice')?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Stock:</span>
                    <p className="font-medium">{getValues('stockQuantity') || '0'} {getValues('unitOfMeasure')}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Supplier:</span>
                    <p className="font-medium truncate">{getValues('supplierName') || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Expiry Date:</span>
                    <p className="font-medium">{getValues('expiryDate') || '—'}</p>
                  </div>
                </div>

                {/* Special Flags */}
                {(getValues('isPerishable') || getValues('requiresPrescription') || getValues('ageRestricted')) && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-gray-700 mb-2">Special Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {getValues('isPerishable') && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                          Perishable
                        </Badge>
                      )}
                      {getValues('requiresPrescription') && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          Prescription Required
                        </Badge>
                      )}
                      {getValues('ageRestricted') && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                          Age {getValues('minAge')}+
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Profit Summary */}
                {getValues('costPrice') > 0 && getValues('sellingPrice') > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700">Profit Margin:</span>
                      <span className="text-sm font-bold text-green-600">{profitMargin}%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  ✅ <strong>Ready to add!</strong> Review the summary above and click "Add Product" to save.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              Step {currentStep} of 4
            </div>

            <div className="flex items-center gap-2">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFormSubmit}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  {isEditMode ? 'Save Changes' : 'Add Product'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}