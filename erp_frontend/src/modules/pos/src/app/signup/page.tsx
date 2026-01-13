'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // Assuming shadcn progress
import { 
  Store, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const totalSteps = 3;
    const progressValue = (step / totalSteps) * 100;

    const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Signup failed');

            router.push('/verify-email');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            {/* BRAND HEADER */}
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Store className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">PaeasyShop</span>
                </div>
            </div>

            <Card className="w-full max-w-xl shadow-xl border-slate-200/60 overflow-hidden">
                {/* STEP PROGRESS BAR */}
                <Progress value={progressValue} className="h-1 rounded-none bg-slate-100" />
                
                <CardHeader className="pt-8 pb-4 text-center">
                    <div className="flex justify-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            Step {step} of {totalSteps}
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                        {step === 1 && "Tell us about your shop"}
                        {step === 2 && "Owner Information"}
                        {step === 3 && "Secure your account"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Start by registering your business name."}
                        {step === 2 && "This information will be used for official reports."}
                        {step === 3 && "Create a strong password to protect your data."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* STEP 1: SHOP INFO */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="shopName" className="font-semibold text-slate-700">Registered Shop Name</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="shopName"
                                            required
                                            className="pl-10 h-11"
                                            value={formData.shopName}
                                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                            placeholder="e.g., Lilongwe Central Trading"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 italic">This name will appear on your customer receipts.</p>
                                </div>
                                <Button type="button" onClick={nextStep} className="w-full h-11 bg-blue-600" disabled={!formData.shopName}>
                                    Next: Owner Details <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* STEP 2: OWNER INFO */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ownerName" className="font-semibold text-slate-700">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="ownerName"
                                                required
                                                className="pl-10 h-11"
                                                value={formData.ownerName}
                                                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                                placeholder="John Banda"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="font-semibold text-slate-700">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                className="pl-10 h-11"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+265..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-semibold text-slate-700">Work Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            className="pl-10 h-11"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="owner@yourshop.com"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" onClick={prevStep} className="h-11">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button type="button" onClick={nextStep} className="flex-1 h-11 bg-blue-600" disabled={!formData.ownerName || !formData.email}>
                                        Next: Security <ShieldCheck className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: SECURITY */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password font-semibold text-slate-700">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                className="pl-10 h-11"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword font-semibold text-slate-700">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                required
                                                className="pl-10 h-11"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-xs font-medium">
                                        {error}
                                    </div>
                                )}

                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>By completing this registration, you agree to Octet Systems' Terms of Service and data protection policies in accordance with Malawian law.</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" onClick={prevStep} className="h-11" disabled={loading}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {loading ? 'Creating account...' : 'Finalize Registration'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:underline font-bold">
                                Log in instead
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}