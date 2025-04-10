/**
 * QR Code Utility functions for the club ticket booking application
 */

import { Ticket } from "@shared/schema";

/**
 * Generates a reference number for a new ticket
 * @returns A unique reference number string
 */
export function generateReferenceNumber(): string {
  const prefix = "TIX";
  // Generate a 5-digit random number (10000-99999)
  const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
  
  return `${prefix}${randomDigits}`;
}

/**
 * Extracts information from a scanned QR code
 * @param code The scanned QR code content
 * @returns Parsed information or null if invalid format
 */
export function parseQRCode(code: string): { type: string; id: string } | null {
  try {
    // For our app, QR codes follow a simple format: TIX#####
    const pattern = /^TIX(\d{5})$/;
    const match = code.match(pattern);
    
    if (!match) {
      return null;
    }
    
    return {
      type: 'ticket',
      id: code
    };
  } catch (error) {
    console.error("Error parsing QR code:", error);
    return null;
  }
}

/**
 * Validates a ticket based on its information
 * @param ticket The ticket to validate
 * @returns Validation result with status and message
 */
export function validateTicket(ticket: Ticket | null): { 
  valid: boolean; 
  message: string;
} {
  if (!ticket) {
    return {
      valid: false,
      message: "Ticket not found"
    };
  }
  
  // Check if ticket is for a future event (in a real app, would check if it's already used)
  const eventDate = new Date(ticket.purchaseDate);
  const now = new Date();
  
  if (eventDate < now) {
    return {
      valid: false,
      message: "Ticket has expired"
    };
  }
  
  return {
    valid: true,
    message: "Valid ticket"
  };
}

/**
 * Formats ticket information for display in the ticket confirmation screen
 * @param ticket The ticket to format
 * @returns Formatted ticket information
 */
export function formatTicketInfo(ticket: Ticket): {
  referenceNumber: string;
  formattedDate: string;
  formattedTime: string;
} {
  const purchaseDate = new Date(ticket.purchaseDate);
  
  return {
    referenceNumber: ticket.referenceNumber,
    formattedDate: purchaseDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    formattedTime: purchaseDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
}
