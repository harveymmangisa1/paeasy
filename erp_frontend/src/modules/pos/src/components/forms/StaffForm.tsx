'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Staff } from '@/lib/db/database';

import { useEffect } from 'react'; // Add this import if not already there

const staffSchema = z.object({
  name: z.string().min(1, 'Staff name is required'),
  username: z.string().min(1, 'Username is required'),
  pin: z.string().length(4, 'PIN must be 4 digits'),
  role: z.enum(['admin', 'manager', 'cashier', 'super_admin']), // Add super_admin here
  tenantId: z.union([z.string(), z.number()]).optional(), // Change tenantId here
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  staff?: Staff;
  onSubmit: (data: StaffFormData) => void;
  children: React.ReactNode;
  currentTenantId: string | number; // Update prop type
}

export function StaffForm({ staff, onSubmit, children, currentTenantId }: StaffFormProps) {
  const {
    register,
    handleSubmit,
    setValue, // Need setValue to set the hidden tenantId
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: staff ? {
      ...staff,
      tenantId: staff.tenantId // Use existing staff's tenantId if editing
    } : {
      name: '',
      username: '',
      pin: '',
      role: 'cashier',
      tenantId: currentTenantId, // Set default for new staff
    },
  });

  // Ensure tenantId is always set for new users, even if staff prop is undefined
  useEffect(() => {
    if (!staff && currentTenantId) {
      setValue('tenantId', currentTenantId);
    }
  }, [staff, currentTenantId, setValue]);

  const isEditMode = !!staff;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update this staff member's information." : "Add a new staff member to the system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Name</label>
            <Input {...register('name')} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div>
            <label>Username</label>
            <Input {...register('username')} />
            {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
          </div>
          <div>
            <label>PIN</label>
            <Input {...register('pin')} />
            {errors.pin && <p className="text-red-500 text-xs">{errors.pin.message}</p>}
          </div>
          <div>
            <label>Role</label>
            <select {...register('role')} className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm">
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option> {/* Add super_admin here */}
            </select>
            {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
          </div>
          <Input type="hidden" {...register('tenantId')} /> {/* Hidden input for tenantId */}
          <DialogFooter>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Add Staff'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
