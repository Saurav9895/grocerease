
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed in successfully!",
        description: "Redirecting to the shop...",
      });
      router.push("/");
    } catch (error: any) {
      console.error(error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential') {
        description = "Invalid email or password. Please try again.";
      } else {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email is required", description: "Please enter your email address to reset your password." });
      return;
    }
    setIsResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "Check your email", description: "A password reset link has been sent to your email address." });
      setIsDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      let description = "Could not send password reset email. Please try again.";
      if (error.code === 'auth/user-not-found') {
        description = "No user found with this email address.";
      }
      toast({ variant: "destructive", title: "Error", description });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignIn}>
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email below to sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" type="button" className="ml-auto inline-block px-0 text-sm">
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Forgot Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we&apos;ll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                      <Label htmlFor="reset-email" className="sr-only">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="m@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                         <Button type="button" variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button type="button" onClick={handlePasswordReset} disabled={isResetLoading}>
                        {isResetLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <div className="text-sm text-center">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
