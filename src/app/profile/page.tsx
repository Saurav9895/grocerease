
"use client";

import { useAuth } from "@/context/AuthProvider";
import { AuthGuard } from "@/components/common/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { List, LogOut, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
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
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Overview</CardTitle>
                            <CardDescription>Manage your orders and account settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="flex items-center gap-4">
                                    <Package className="w-6 h-6 text-primary"/>
                                    <div>
                                        <h3 className="font-semibold">Shipping Addresses</h3>
                                        <p className="text-sm text-muted-foreground">Manage your saved addresses for faster checkout.</p>
                                    </div>
                                </div>
                                <Button variant="secondary" disabled>Manage</Button>
                            </div>
                        </CardContent>
                    </Card>
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
