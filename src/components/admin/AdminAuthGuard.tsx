
"use client";

import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider } from '../ui/sidebar';
import { AdminSidebar } from './AdminSidebar';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // Wait until loading is finished

        if (!user) {
            router.replace('/signin');
            return;
        }
        
        // After auth is loaded, if profile is available but user is not admin
        if (profile && !profile.isAdmin) {
             router.replace('/'); // Redirect non-admins to homepage
        }

    }, [user, profile, loading, router]);

    // Show skeleton while loading auth or profile, or if the user is not an admin yet (profile is still loading or they are being redirected)
    if (loading || !profile || !profile.isAdmin) {
        return (
          <SidebarProvider>
            <div className="flex min-h-screen">
              <AdminSidebar />
              <main className="flex-1 p-8 bg-muted/40">
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-10 w-1/4" />
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-28 w-full" />
                  </div>
                  <Skeleton className="h-96 w-full" />
                </div>
              </main>
            </div>
          </SidebarProvider>
        );
    }

    return <>{children}</>;
}
