"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { LoaderCircleIcon } from "lucide-react";

const messageSchema = z.object({
  recipient: z.string().min(1, "Recipient's mobile number is required").regex(/^[0-9]{10,15}$/, "Invalid mobile number format"),
  content: z.string().min(1, "Message content is required").max(160, "Message content exceeds character limit"),
});

type MessageFormData = z.infer<typeof messageSchema>;

const ComposeMessagePage: React.FC = () => {
  const { data: session } = useSession();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
  });

  const onSubmit = async (data: MessageFormData) => {
    try {
      const payload = {
        recipient: data.recipient,
        content: data.content,
      };

      const response = await api.post(`/api/users/${session?.user.id}/messages`, payload);

      if (response.data.success) {
        toast.success("Message sent successfully!");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Compose Message</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient's Mobile Number</Label>
              <Input {...register("recipient")} placeholder="Enter recipient's mobile number" />
              {errors.recipient && (
                <p className="text-red-500 text-sm">{errors.recipient.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea {...register("content")} placeholder="Compose your message" />
              {errors.content && (
                <p className="text-red-500 text-sm">{errors.content.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ComposeMessagePage;