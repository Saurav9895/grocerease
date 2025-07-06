

"use client";

import { useAuth } from "@/context/AuthProvider";
import { AuthGuard } from "@/components/common/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { List, LogOut, Settings, Phone, ShieldCheck, KeyRound, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddressManager } from "@/components/shop/AddressManager";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminManager } from "@/components/admin/AdminManager";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { updateUserPhone } from "@/lib/data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PasswordChangeForm } from "@/components/shop/PasswordChangeForm";
import { VendorProfileManager } from "@/components/vendor/VendorProfileManager";


function ProfilePageContent() {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phone, setPhone] = useState("");
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

    useEffect(() => {
        if (!user || profile) {
            setIsLoadingProfile(false);
        }
        if (profile?.phone) {
            setPhone(profile.phone);
        }
    }, [user, profile]);

    const handlePhoneCancel = () => {
        setIsEditingPhone(false);
        setPhone(profile?.phone || "");
    };

    const handlePhoneSave = async () => {
        if (!user) return;
        if (phone === profile?.phone) {
            setIsEditingPhone(false);
            return;
        }

        setIsUpdatingPhone(true);
        try {
            await updateUserPhone(user.uid, phone);
            await refreshProfile();
            toast({ title: "Phone number updated successfully!" });
            setIsEditingPhone(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not update your phone number." });
        } finally {
            setIsUpdatingPhone(false);
        }
    };


    const getInitials = (nameOrEmail: string | null | undefined) => {
        if (!nameOrEmail) return "U";
        if (nameOrEmail.includes('@')) {
            const parts = nameOrEmail.split("@")[0].split(".").map((part) => part[0]).join("");
            return parts.slice(0, 2).toUpperCase();
        }
        const names = nameOrEmail.split(' ');
        if (names.length > 1 && names[1]) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return nameOrEmail.slice(0, 2).toUpperCase();
    };

    const handleSignOut = async () => {
        await signOut();
        toast({
          title: "Signed out successfully.",
        });
        router.push("/");
    };
    
    const ProfileSkeleton = () => (
        <Card>
            <CardHeader className="items-center text-center">
                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                 <Skeleton className="h-10 w-full mb-4" />
                 <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 flex flex-col gap-8">
                    {isLoadingProfile || !user || !profile ? <ProfileSkeleton /> : (
                        <Card>
                            <CardHeader className="items-center text-center">
                                <Avatar className="h-24 w-24 mb-4">
                                    <AvatarFallback className="text-3xl">{getInitials(profile?.name || user.email)}</AvatarFallback>
                                </Avatar>
                                <CardTitle className="flex items-center gap-2">
                                    {profile?.name || "Valued Customer"}
                                    {profile?.adminRole && (
                                        <Badge variant={
                                            profile.adminRole === 'main' ? 'destructive' :
                                            profile.adminRole === 'delivery' ? 'default' :
                                            'secondary'
                                        } className="flex items-center gap-1">
                                            {profile.adminRole === 'delivery' ? <Truck className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                                            {
                                                profile.adminRole === 'main' ? 'Main Admin' :
                                                profile.adminRole === 'delivery' ? 'Delivery Person' :
                                                'Admin'
                                            }
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>{profile?.email}</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <Button onClick={handleSignOut} variant="outline" className="w-full">
                                 <LogOut className="mr-2 h-4 w-4" />
                                 Sign Out
                               </Button>
                            </CardContent>
                        </Card>
                    )}
                     <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="flex items-center gap-4">
                                    <KeyRound className="w-6 h-6 text-primary"/>
                                    <div>
                                        <h3 className="font-semibold">Password</h3>
                                        <p className="text-sm text-muted-foreground">Change your account password.</p>
                                    </div>
                                </div>
                                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary">Change</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Change Password</DialogTitle>
                                            <DialogDescription>
                                                Enter your current password and a new password.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <PasswordChangeForm onSuccess={() => setIsPasswordDialogOpen(false)} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="flex items-center gap-4 flex-grow">
                                    <Phone className="w-6 h-6 text-primary flex-shrink-0"/>
                                    <div className="w-full">
                                        <h3 className="font-semibold">Mobile Number</h3>
                                        {isEditingPhone ? (
                                            <Input 
                                                type="tel"
                                                className="mt-1 h-9"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Enter mobile number"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">{profile?.phone || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4 flex-shrink-0">
                                {isEditingPhone ? (
                                    <>
                                        <Button variant="default" size="sm" onClick={handlePhoneSave} disabled={isUpdatingPhone}>
                                            {isUpdatingPhone ? "Saving..." : "Save"}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handlePhoneCancel} disabled={isUpdatingPhone}>Cancel</Button>
                                    </>
                                ) : (
                                    <Button variant="secondary" onClick={() => setIsEditingPhone(true)}>Edit</Button>
                                )}
                                </div>
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

                    {profile?.adminRole === 'vendor' && profile.vendorId && (
                        <VendorProfileManager />
                    )}

                    {profile?.adminRole === 'main' && (
                        <>
                            <Separator />
                            <AdminManager />
                        </>
                    )}
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
