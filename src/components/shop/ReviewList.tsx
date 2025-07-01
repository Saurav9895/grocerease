

"use client";

import type { Review } from "@/lib/types";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface ReviewListProps {
  reviews: Review[];
}

const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className="h-4 w-4" 
            fill={i < rating ? "currentColor" : "none"} 
            stroke={i < rating ? "currentColor" : "hsl(var(--muted-foreground))"}
          />
        ))}
      </div>
    );
};

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
       <div className="p-8 text-center bg-card border rounded-lg">
        <p className="text-muted-foreground">This product has no reviews yet. Be the first to leave one!</p>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-4">
          <Avatar>
            <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">{review.userName}</p>
                    <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">{format(review.createdAt, 'PPP')}</p>
            </div>
            <p className="mt-2 text-muted-foreground">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
