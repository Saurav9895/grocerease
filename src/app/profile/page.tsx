
"use client";

import { useAuth } from "@/context/AuthProvider";
import { AuthGuard } from "@/components/common/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { List, LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddressManager } from "@/components/shop/AddressManager";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

function ProfilePageContent() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const getInitials = (email: string | null | undefined) => {
        if (!email) return "U";
        const parts = email.split("@")[0].split(".").map((part) => part[0]).join("");
        return parts.slice(0, 2).toUpperCase();
    };

    const handleSignOut = async () => {
        await signOut();
        toast({
          title: "Signed out successfully.",
        });
        router.push("/");
    };
    
    const handlePasswordReset = async () => {
        if (!user?.email) {
            toast({ variant: "destructive", title: "Could not send reset email.", description: "No email address associated with this account." });
            return;
        }
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast({ title: "Password reset email sent", description: "Please check your inbox to reset your password." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={user?.photoURL || `https://i.pravatar.cc/120?u=${user?.uid}`} alt={user?.email || 'User'} data-ai-hint="user avatar" />
                                <AvatarFallback className="text-3xl">{getInitials(user?.email)}</AvatarFallback>
                            </Avatar>
                            <CardTitle>{user?.displayName || "Valued Customer"}</CardTitle>
                            <CardDescription>{user?.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Button onClick={handleSignOut} variant="outline" className="w-full">
                             <LogOut className="mr-2 h-4 w-4" />
                             Sign Out
                           </Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="flex items-center gap-4">
                                    <Settings className="w-6 h-6 text-primary"/>
                                    <div>
                                        <h3 className="font-semibold">Password</h3>
                                        <p className="text-sm text-muted-foreground">Reset your password.</p>
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={handlePasswordReset}>Send Reset Email</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Account Overview</CardTitle>
                            <CardDescription>Manage your orders and saved addresses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="flex items-center gap-4">
                                    <List className="w-6 h-6 text-primary"/>
                                    <div>
                                        <h3 className="font-semibold">My Orders</h3>
                                        <p className="text-sm text-muted-foreground">View your order history and track shipments.</p>
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={() => router.push('/orders')}>View Orders</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <AddressManager />
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfilePageContent />
        </AuthGuard>
    )
}
