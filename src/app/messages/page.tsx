"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  Clock,
  User,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function MessagesPage() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      fetchMessages();
    }
  }, [isAuthenticated, user, loading]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/messages?userId=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const { messages } = await response.json();
        
        // Group messages by conversation
        const conversationMap = new Map<string, Conversation>();
        
        messages.forEach((message: Message) => {
          const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
          const otherUserName = message.senderId === user?.id ? message.receiverName : message.senderName;
          
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              userId: otherUserId,
              userName: otherUserName,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              unreadCount: 0,
              messages: [],
            });
          }
          
          const conversation = conversationMap.get(otherUserId)!;
          conversation.messages.push(message);
          
          // Update last message if this one is newer
          if (new Date(message.createdAt) > new Date(conversation.lastMessageTime)) {
            conversation.lastMessage = message.content;
            conversation.lastMessageTime = message.createdAt;
          }
          
          // Count unread messages
          if (message.receiverId === user?.id && !message.isRead) {
            conversation.unreadCount++;
          }
        });
        
        // Sort conversations by last message time
        const sortedConversations = Array.from(conversationMap.values()).sort(
          (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
        
        // Sort messages within each conversation
        sortedConversations.forEach(conv => {
          conv.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
        
        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      setIsSending(true);
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: newMessage.trim(),
        }),
      });
      
      if (response.ok) {
        setNewMessage("");
        await fetchMessages(); // Refresh messages
        toast({
          title: "Success",
          description: "Message sent successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const markAsRead = async (conversationUserId: string) => {
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId: conversationUserId,
        }),
      });
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.userId === conversationUserId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const selectedConv = conversations.find(conv => conv.userId === selectedConversation);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Required</h3>
              <p className="text-gray-600">Please log in to view your messages.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with other ReWear users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No conversations yet</p>
                  <p className="text-sm text-gray-500">Start messaging other users to see conversations here</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.userId ? 'bg-green-50 border-green-200' : ''
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation.userId);
                        markAsRead(conversation.userId);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.userAvatar} />
                          <AvatarFallback>
                            {conversation.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.userName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(conversation.lastMessageTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages View */}
          <Card className="lg:col-span-2">
            {selectedConv ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConv.userAvatar} />
                        <AvatarFallback>
                          {selectedConv.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedConv.userName}</h3>
                        <p className="text-xs text-gray-500">ReWear User</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[480px]">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConv.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?.id ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        disabled={isSending}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSending}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the left to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
