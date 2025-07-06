

"use client";

import { useState, useEffect } from "react";
import { findUserByEmail, updateUserAdminRole, getAdminUsers } from "@/lib/data";
import type { UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCog, Trash2, Truck, Store } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdminManager() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAdmins, setIsFetchingAdmins] = useState(true);
  const [roleToGrant, setRoleToGrant] = useState<'standard' | 'delivery' | 'vendor'>('standard');

  const fetchAdmins = async () => {
    setIsFetchingAdmins(true);
    const adminUsers = await getAdminUsers();
    setAdmins(adminUsers);
    setIsFetchingAdmins(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userToUpdate = await findUserByEmail(email);
      if (!userToUpdate) {
        toast({ variant: "destructive", title: "User not found", description: `No user with the email ${email} exists.` });
        setIsLoading(false);
        return;
      }
      
      if (userToUpdate.adminRole) {
        toast({ variant: "destructive", title: "Already has a Role", description: `${userToUpdate.name} already has a special role.` });
        setIsLoading(false);
        return;
      }

      await updateUserAdminRole(userToUpdate.id, roleToGrant);
      toast({ title: "Success", description: `${userToUpdate.name} has been made a ${roleToGrant} user.` });
      setEmail("");
      fetchAdmins();
    } catch (error) {
      console.error("Error setting role:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update the user's role." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeRole = async (userId: string, userName: string) => {
    try {
        await updateUserAdminRole(userId, null);
        toast({ title: "Role Removed", description: `${userName}'s special role has been revoked.` });
        fetchAdmins();
    } catch (error) {
        console.error("Error removing role:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not remove user role." });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
        <CardDescription>Grant or revoke special roles for users.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleGrantRole} className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium flex items-center gap-2"><UserCog className="h-4 w-4"/>Grant User Role</h3>
          <div className="flex flex-col sm:flex-row items-end gap-2">
            <div className="flex-1 w-full">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
             <div className="w-full sm:w-auto">
              <Label htmlFor="role-select">Role</Label>
              <Select value={roleToGrant} onValueChange={(value) => setRoleToGrant(value as 'standard' | 'delivery' | 'vendor')}>
                <SelectTrigger id="role-select" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Admin</SelectItem>
                  <SelectItem value="delivery">Delivery Person</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Granting..." : "Grant Role"}</Button>
          </div>
        </form>

        <div>
          <h3 className="font-medium mb-2">Current Staff</h3>
          <div className="space-y-2">
            {isFetchingAdmins ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : admins.length > 0 ? (
                admins.map(admin => (
                    <div key={admin.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                            <p className="font-semibold">{admin.name}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={
                                admin.adminRole === 'main' ? "destructive" : 
                                admin.adminRole === 'vendor' ? 'default' :
                                admin.adminRole === 'delivery' ? 'outline' : 
                                "secondary"
                            } className="flex items-center gap-1">
                                {
                                  admin.adminRole === 'delivery' ? <Truck className="h-3 w-3" /> :
                                  admin.adminRole === 'vendor' ? <Store className="h-3 w-3" /> : 
                                  <ShieldCheck className="h-3 w-3" />
                                }
                                {
                                  admin.adminRole === 'main' ? 'Main Admin' :
                                  admin.adminRole === 'standard' ? 'Admin' :
                                  admin.adminRole === 'delivery' ? 'Delivery Person' :
                                  'Vendor'
                                }
                            </Badge>
                            {(admin.adminRole === 'standard' || admin.adminRole === 'delivery' || admin.adminRole === 'vendor') && admin.id !== currentUser?.uid && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4"/>
                                            <span className="sr-only">Revoke Role</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Revoke role for {admin.name}?</AlertDialogTitle>
                                            <AlertDialogDescription>This will revoke all special privileges for this user. They will become a regular customer.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRevokeRole(admin.id, admin.name)}>Confirm</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No admins, vendors, or delivery staff found.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
