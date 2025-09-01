'use client'

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, Home } from "lucide-react";

interface NotFoundProps {
  title?: string;
  message?: string;
  onGoHome: () => void;
}

export function NotFound({ 
  title = "Poll Not Found", 
  message = "The poll you're looking for doesn't exist or has been removed.",
  onGoHome 
}: NotFoundProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <Card>
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{message}</p>
            <Button onClick={onGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}