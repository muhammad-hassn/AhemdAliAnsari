import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
