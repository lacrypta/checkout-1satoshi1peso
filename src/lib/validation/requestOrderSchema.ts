import { z } from 'zod';

export const requestOrderSchema = z.object({
  fullname: z.string().min(3, { message: 'Fullname is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  ticketQuantity: z
    .number()
    .int()
    .lt(10)
    .positive({ message: 'Ticket Quantity must be a number' }),
  newsletter: z.boolean({ message: 'Newsletter must be a boolean' }),
  code: z.string().optional(),
});
