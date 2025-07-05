
"use client";

import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DeliverySidebar } from './DeliverySidebar';

export function DeliveryAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace('/signin');
            return;
        }
        
        if (profile && profile.adminRole !== 'delivery') {
             router.replace('/'); // Redirect non-delivery persons to homepage
        }

    }, [user, profile, loading, router]);

    if (loading || !profile || profile.adminRole !== 'delivery') {
        return (
          <SidebarProvider>
            <div className="flex min-h-screen">
              <DeliverySidebar />
              <main className="flex-1 p-8 bg-muted/40">
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-10 w-1/4" />
                  <Skeleton className="h-96 w-full" />
                </div>
              </main>
            </div>
          </SidebarProvider>
        );
    }

    return <>{children}</>;
}
