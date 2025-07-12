"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Simple toast replacement  
const useToast = () => ({
  toast: ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    const message = title && description ? `${title}: ${description}` : title || description || '';
    if (variant === 'destructive') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  }
});

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
  };
  itemTitle?: string;
}

export default function MessageModal({
  isOpen,
  onClose,
  recipient,
  itemTitle
}: MessageModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!token || !isAuthenticated) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages. Please login first.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: recipient.id,
          content: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message sent successfully!",
        });
        onClose();
        setMessage("");
      } else {
        toast({
          title: "Error",
          description: data.error || `Failed to send message (${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setMessage("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Message {recipient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {itemTitle && (
            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-sm text-gray-600">About item:</p>
              <p className="font-medium">{itemTitle}</p>
            </div>
          )}

          <div>
            <Label htmlFor="message" className="text-base font-medium">
              Your message
            </Label>
            <Textarea
              id="message"
              placeholder={`Send a message to ${recipient.name}${itemTitle ? ` about "${itemTitle}"` : ''}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
            >
              {isSubmitting ? (
                <>
                  <MessageCircle className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
