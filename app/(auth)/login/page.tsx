"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get callbackUrl from URL search params
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl") || "/dashboard";
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // If ok is true, authentication succeeded
      if (result?.ok) {
        // Decode the callback URL if it's encoded
        let targetUrl = callbackUrl;
        try {
          targetUrl = decodeURIComponent(callbackUrl);
        } catch {
          // If decoding fails, use the original
          targetUrl = callbackUrl;
        }
        
        // Extract path from full URL if needed (handle both relative and absolute URLs)
        try {
          const url = new URL(targetUrl, window.location.origin);
          targetUrl = url.pathname + url.search;
        } catch {
          // If it's already a relative path, use it as is
          if (!targetUrl.startsWith('/')) {
            targetUrl = '/dashboard';
          }
        }
        
        // Wait a bit longer to ensure the session cookie is set and available
        // Then do a full page reload to ensure middleware can read the session
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 300);
      } else {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            LearnWithAnaGH
          </CardTitle>
          <CardDescription className="text-center">
            Admin Login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@learnwithanagh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
