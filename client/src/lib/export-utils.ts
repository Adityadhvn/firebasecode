import { stringify } from 'csv-stringify/sync';
import { saveAs } from 'file-saver';
import { User, Event, Ticket } from '@shared/schema';

/**
 * Exports user data to CSV and triggers download
 */
export function exportUsersToCsv(users: User[]) {
  // Format data for CSV export
  const csvData = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    userType: user.isSuperAdmin 
      ? 'Super Admin' 
      : user.isOrganizer 
        ? 'Organizer' 
        : 'Regular User',
    dateJoined: new Date().toISOString().split('T')[0] // Just for demo purposes
  }));
  
  // Set up headers for the CSV
  const header = ['ID', 'Username', 'Email', 'Full Name', 'User Type', 'Date Joined'];
  
  // Generate CSV string using csv-stringify
  const csvContent = stringify([
    header,
    ...csvData.map(row => [
      row.id,
      row.username,
      row.email,
      row.fullName,
      row.userType,
      row.dateJoined
    ])
  ]);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `users-${new Date().toISOString().split('T')[0]}.csv`);
}

/**
 * Exports ticket sales data to CSV and triggers download
 */
export function exportTicketSalesToCSV(tickets: Ticket[], events: Event[]) {
  // Format data for CSV export
  const csvData = tickets.map(ticket => {
    const event = events.find(e => e.id === ticket.eventId);
    return {
      id: ticket.id,
      event: event?.title || 'Unknown Event',
      user: ticket.userId.toString(),
      date: new Date(ticket.purchaseDate).toLocaleDateString(),
      quantity: ticket.quantity,
      price: ticket.totalPrice || 0,
      reference: ticket.referenceNumber,
    };
  });
  
  // Set up headers for the CSV
  const header = ['Ticket ID', 'Event', 'User ID', 'Purchase Date', 'Quantity', 'Price', 'Reference Number'];
  
  // Generate CSV string using csv-stringify
  const csvContent = stringify([
    header,
    ...csvData.map(row => [
      row.id,
      row.event,
      row.user,
      row.date,
      row.quantity,
      row.price,
      row.reference
    ])
  ]);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `ticket-sales-${new Date().toISOString().split('T')[0]}.csv`);
}

/**
 * Exports event data to CSV and triggers download
 */
export function exportEventsToCsv(events: Event[], eventOrganizers: User[]) {
  // Format data for CSV export
  const csvData = events.map(event => {
    const organizer = eventOrganizers.find(o => o.id === event.organizedById);
    return {
      id: event.id,
      title: event.title,
      date: new Date(event.date).toLocaleDateString(),
      location: event.location,
      address: event.address,
      organizer: organizer?.fullName || 'Unknown',
      isFeatured: event.featured ? 'Yes' : 'No',
      tags: event.tags?.join(', ') || ''
    };
  });
  
  // Set up headers for the CSV
  const header = ['ID', 'Event Title', 'Date', 'Location', 'Address', 'Organizer', 'Featured', 'Tags'];
  
  // Generate CSV string using csv-stringify
  const csvContent = stringify([
    header,
    ...csvData.map(row => [
      row.id,
      row.title,
      row.date,
      row.location,
      row.address,
      row.organizer,
      row.isFeatured,
      row.tags
    ])
  ]);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `events-${new Date().toISOString().split('T')[0]}.csv`);
}