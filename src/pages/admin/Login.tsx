import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock } from "lucide-react";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement with Supabase auth
    console.log("Login attempt:", { email });
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 pattern-bg opacity-10" />
      
      <Card className="w-full max-w-md relative z-10 border-0 shadow-lg">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full hero-gradient flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-heading text-2xl">ﷲ</span>
            </div>
          </Link>
          <CardTitle className="font-heading text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg">
              <Lock className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Website
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
