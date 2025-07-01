
"use client";

import { useState, useEffect } from "react";
import { findUserByEmail, updateUserAdminRole, getAdminUsers } from "@/lib/data";
import type { UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCog, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function AdminManager() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserProfile['adminRole']>('restricted');
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAdmins, setIsFetchingAdmins] = useState(true);

  const fetchAdmins = async () => {
    setIsFetchingAdmins(true);
    const adminUsers = await getAdminUsers();
    setAdmins(adminUsers);
    setIsFetchingAdmins(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSetRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userToUpdate = await findUserByEmail(email);
      if (!userToUpdate) {
        toast({ variant: "destructive", title: "User not found", description: `No user with the email ${email} exists.` });
        return;
      }

      await updateUserAdminRole(userToUpdate.id, role);
      toast({ title: "Success", description: `${userToUpdate.name}'s role has been set to ${role}.` });
      setEmail("");
      fetchAdmins();
    } catch (error) {
      console.error("Error setting admin role:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not update the user's role." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string, userName: string) => {
    try {
        await updateUserAdminRole(userId, null);
        toast({ title: "Admin Removed", description: `${userName} is no longer an admin.` });
        fetchAdmins();
    } catch (error) {
        console.error("Error removing admin role:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not remove admin role." });
    }
  };

  const roleDisplay: Record<string, string> = {
    full: 'Full Access',
    restricted: 'Restricted Access'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Management</CardTitle>
        <CardDescription>Grant, modify, or revoke admin privileges for users.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSetRole} className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium flex items-center gap-2"><UserCog className="h-4 w-4"/>Set User Role</h3>
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
              <Label htmlFor="role">Role</Label>
              <Select value={role || 'restricted'} onValueChange={(v) => setRole(v as UserProfile['adminRole'])}>
                <SelectTrigger id="role" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Access</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Set Role"}</Button>
          </div>
        </form>

        <div>
          <h3 className="font-medium mb-2">Current Admins</h3>
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
                            <Badge variant={admin.adminRole === 'full' ? 'destructive' : 'secondary'} className="flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                {roleDisplay[admin.adminRole!]}
                            </Badge>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4"/>
                                        <span className="sr-only">Remove Admin Role</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Remove admin rights for {admin.name}?</AlertDialogTitle>
                                        <AlertDialogDescription>This will revoke all admin privileges for this user. They will become a regular customer.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemoveAdmin(admin.id, admin.name)}>Confirm</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No admins found.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
