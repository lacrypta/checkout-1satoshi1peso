'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

export type TicketInfo = {
  user: {
    fullname: string;
    email: string;
  };
  ticketId: string;
  checkIn: boolean;
};

export const createColumns = (
  handleCheckIn: (ticketId: string) => void
): ColumnDef<TicketInfo>[] => [
  {
    accessorKey: 'ticketId',
    header: 'Ticket ID',
  },
  {
    accessorKey: 'user',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        <div>{row.original.user.fullname}</div>
        <div className="text-sm text-gray-500">{row.original.user.email}</div>
      </div>
    ),
    sortingFn: (a, b) => {
      const nameA = a.original.user.fullname.toLowerCase();
      const nameB = b.original.user.fullname.toLowerCase();

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;

      const emailA = a.original.user.email.toLowerCase();
      const emailB = b.original.user.email.toLowerCase();

      return emailA.localeCompare(emailB);
    },
  },
  {
    accessorKey: 'checkIn',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Check-In
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge variant={row.original.checkIn ? 'default' : 'destructive'}>
        {row.original.checkIn ? 'Checked In' : 'Not Checked In'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.ticketId)}
            >
              Copy ticket ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleCheckIn(order.ticketId)}
              disabled={order.checkIn}
            >
              Check In
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
