"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateRecommendations } from "@/ai/flows/generate-recommendations";
import { Wand2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      // In a real app, this would be fetched for the logged-in user
      const purchaseHistory = "Organic Bananas, Free-Range Eggs, Sourdough Bread";
      
      try {
        const result = await generateRecommendations({ purchaseHistory });
        setRecommendations(result.recommendations.split(',').map(r => r.trim()));
      } catch (error) {
        console.error("Failed to generate recommendations:", error);
        // Set some default recommendations on error
        setRecommendations(["Fresh Avocados", "Greek Yogurt", "Cold Brew Coffee"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          <span>Just for You</span>
        </CardTitle>
        <CardDescription>
          AI-powered recommendations based on your purchase history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-28" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recommendations.map((rec, index) => (
              <Badge key={index} variant="outline" className="text-base py-1 px-3 bg-accent/30 border-accent">
                {rec}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
