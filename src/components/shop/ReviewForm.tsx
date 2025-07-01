
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { addReviewAndUpdateProduct } from "@/lib/data";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ variant: "destructive", title: "Please select a rating." });
      return;
    }
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to leave a review." });
      return;
    }

    setIsLoading(true);
    try {
      const newReview: Omit<Review, 'id' | 'createdAt'> = {
        userId: user.uid,
        userName: user.displayName || user.email || "Anonymous",
        userAvatarUrl: user.photoURL || `https://i.pravatar.cc/40?u=${user.uid}`,
        rating,
        comment,
      };
      await addReviewAndUpdateProduct(productId, newReview);
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (error) {
      console.error("Error submitting review", error);
      toast({ variant: "destructive", title: "Failed to submit review", description: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block">Your Rating</Label>
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "h-6 w-6 cursor-pointer transition-colors",
                        (hoverRating >= star || rating >= star) 
                            ? "text-amber-400 fill-amber-400" 
                            : "text-muted-foreground"
                    )}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                />
            ))}
        </div>
      </div>
       <div>
        <Label htmlFor="comment">Your Review</Label>
        <Textarea 
            id="comment"
            placeholder="What did you like or dislike?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
        />
       </div>
      <Button type="submit" disabled={isLoading || rating === 0}>
        {isLoading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
