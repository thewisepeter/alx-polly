'use client'

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Share2, 
  Copy, 
  Twitter, 
  Facebook, 
  Linkedin, 
  QrCode,
  Download,
  Check
} from "lucide-react";
import { Poll } from "../lib/mockData";
import { useToast } from "./ui/use-toast";

interface PollShareProps {
  poll: Poll;
  onClose: () => void;
}

export function PollShare({ poll, onClose }: PollShareProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const { toast } = useToast();

  // Generate poll URL
  const pollUrl = `${window.location.origin}/poll/${poll.id}`;
  
  // Social sharing text
  const shareText = `Check out this poll: "${poll.question}" - Vote now!`;

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const response = await fetch(`/api/polls/${poll.id}/qrcode?baseUrl=${window.location.origin}`);
        if (response.ok) {
          const data = await response.json();
          setQrCodeDataUrl(data.qrCode);
          setShareUrl(data.shareUrl);
        } else {
          toast({
            title: "Error generating QR code",
            description: "Could not generate a QR code for this poll.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error generating QR code",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    };

    generateQRCode();
  }, [poll.id, toast]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || pollUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareOnSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl || pollUrl);
    
    let shareUrlString = '';
    
    switch (platform) {
      case 'twitter':
        shareUrlString = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrlString = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'linkedin':
        shareUrlString = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodeURIComponent(poll.question)}`;
        break;
    }
    
    if (shareUrlString) {
      window.open(shareUrlString, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `poll-${poll.id}-qr.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Poll
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Poll Info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium truncate">{poll.question}</p>
              <p className="text-sm text-muted-foreground">
                {poll.totalVotes} votes • {poll.options.length} options
              </p>
            </div>

            <Tabs defaultValue="link" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="link">Link</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="qr">QR Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="link" className="space-y-4">
                <div>
                  <Label>Poll Link</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={pollUrl} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-600 mt-1">Link copied to clipboard!</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                <div>
                  <Label>Share on Social Media</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <Button 
                      onClick={() => shareOnSocial('twitter')}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Button>
                    <Button 
                      onClick={() => shareOnSocial('facebook')}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                    <Button 
                      onClick={() => shareOnSocial('linkedin')}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Custom Message</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{shareText}</p>
                    <p className="text-sm text-muted-foreground mt-1">{pollUrl}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="qr" className="space-y-4">
                <div className="text-center">
                  <Label>QR Code</Label>
                  <div className="mt-2 flex flex-col items-center gap-4">
                    <div className="p-4 bg-white border rounded-lg">
                      <canvas 
                        ref={canvasRef}
                        className="block"
                        style={{ width: '150px', height: '150px' }}
                      />
                    </div>
                    <Button 
                      onClick={downloadQRCode}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download QR Code
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Scan this QR code to access the poll directly
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}