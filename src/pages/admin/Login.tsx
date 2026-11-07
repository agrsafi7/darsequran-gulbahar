import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminAppearance } from "@/components/admin/AdminAppearance";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Checking admin access...",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAppearance>
      <div className="min-h-svh flex items-center justify-center p-6 bg-background">
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" /> :
          <div className="w-full max-w-sm">
            <h1 className="text-center mb-6">DarseQuran Gulbahar Peshawar</h1>
            <section className="admin-login-panel" aria-label="Admin sign in">
              <h2 className="text-lg font-semibold mb-6">Sign In</h2>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2"><Label htmlFor="login-email">Email</Label><Input id="login-email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} /></div>
                <div className="space-y-2"><Label htmlFor="login-password">Password</Label>
                  <div className="relative"><Input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="pr-10" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} disabled={loading}>{showPassword ? <EyeOff /> : <Eye />}</Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <Lock />} Sign In</Button>
              </form>
            </section>
            <Link to="/" className="block mt-5 text-sm text-center">← Back to Website</Link>
          </div>}
      </div>
    </AdminAppearance>
  );
};
export default AdminLogin;
