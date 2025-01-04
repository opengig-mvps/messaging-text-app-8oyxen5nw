"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";

// Zod schema for message sending
const messageSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  content: z.string().min(1, "Message content is required"),
});

type MessageFormData = z.infer<typeof messageSchema>;

const IntegrateTwilio: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/messages");
      setMessages(res.data.data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const onSubmit = async (data: MessageFormData) => {
    try {
      const payload = {
        recipient: data.recipient,
        content: data.content,
      };

      const response = await api.post(
        `/api/users/${session?.user?.id}/messages`,
        payload
      );

      if (response.data.success) {
        toast.success("Message sent successfully!");
        fetchMessages();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Integrate Twilio</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Send Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                {...register("recipient")}
                placeholder="Enter recipient's mobile number"
              />
              {errors.recipient && (
                <p className="text-red-500 text-sm">{errors.recipient.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                {...register("content")}
                placeholder="Enter your message"
              />
              {errors.content && (
                <p className="text-red-500 text-sm">{errors.content.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin">Loading...</div>
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Sent Messages</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages?.map((message: any) => (
                <TableRow key={message?.id}>
                  <TableCell>{message?.recipient}</TableCell>
                  <TableCell>{message?.content}</TableCell>
                  <TableCell>{message?.status}</TableCell>
                  <TableCell>{new Date(message?.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default IntegrateTwilio;