'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Lock, User, Eye, EyeOff, Loader2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db/database';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithPin, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await db.shopSettings.toCollection().first();
        if (settings?.logo) setLogoUrl(settings.logo);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchLogo();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    setLoading(true);
    setError('');

    const success = await login(username, password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }
    setLoading(true);
    setError('');

    const success = await loginWithPin(pin);
    if (!success) {
      setError('Incorrect PIN');
      setLoading(false);
      setPin(''); // Clear PIN on failure
    } else {
      router.push('/dashboard');
    }
  };

  // Full screen loader with brand identity
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Store className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <p className="mt-6 text-slate-500 font-medium animate-pulse">Initializing PaeasyShop...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* LEFT SIDE: Visual/Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {/* Subtle Grid Pattern or Shop Graphic */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">PaeasyShop</span>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-6">
            The heart of your <br />
            <span className="text-blue-500">Retail Operations.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md">
            Securely access your inventory, sales, and staff management tools in one place.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-slate-400">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <span>End-to-end encrypted connection via Octet Systems Cloud.</span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50/50">
        <div className="w-full max-w-[400px] space-y-8">

          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-black text-slate-900">PaeasyShop</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm font-medium">Please sign in to your dashboard</p>
          </div>

          <Card className="border-slate-200/60 shadow-xl shadow-slate-200/50">
            <CardHeader className="pb-4">
              <Tabs defaultValue="credentials" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 p-1">
                  <TabsTrigger value="credentials" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Manager</TabsTrigger>
                  <TabsTrigger value="pin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Staff PIN</TabsTrigger>
                </TabsList>

                <TabsContent value="credentials" className="pt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500">Email Address</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="name@business.com"
                          className="pl-10 h-11 border-slate-200 focus:ring-blue-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-500">Password</Label>
                        <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10 h-11 border-slate-200 focus:ring-blue-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="bg-red-50 border-red-100 py-3">
                        <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {loading ? 'Authenticating...' : 'Enter Dashboard'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="pin" className="pt-6 text-center">
                  <form onSubmit={handlePinLogin} className="space-y-6">
                    <div className="space-y-4">
                      <Label htmlFor="pin" className="text-xs font-bold uppercase text-slate-500">Quick Access PIN</Label>
                      <div className="relative max-w-[200px] mx-auto">
                        <Input
                          id="pin"
                          type="password"
                          inputMode="numeric"
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="0000"
                          className="h-16 text-center text-3xl tracking-[1em] font-black border-slate-200 focus:ring-blue-600"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Enter 4-digit staff code</p>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold"
                      disabled={loading || pin.length < 4}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Unlock System'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          <div className="text-center pt-4">
            <Link href="/signup" className="group text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Don't have an account? <span className="text-blue-600 font-bold underline-offset-4 group-hover:underline">Register your shop here</span>
            </Link>
          </div>

          <div className="pt-8 text-center border-t border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              Powered by Octet Systems Malawi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}