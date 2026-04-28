// ────────────────────────────────────────────────────────────────
// Shared TypeScript types matching backend models
// ────────────────────────────────────────────────────────────────

export enum UserRole {
  Customer = 'customer',
  Staff = 'staff',
  Admin = 'admin',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: Address;
  mfaEnabled: boolean;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export enum ServiceType {
  Standard = 'standard',
  Deep = 'deep',
  MoveIn = 'moveIn',
  MoveOut = 'moveOut',
  Office = 'office',
  Retail = 'retail',
  Medical = 'medical',
  Industrial = 'industrial',
  PostConstruction = 'postConstruction',
  Recurring = 'recurring',
}

export enum BookingStatus {
  PendingQuote = 'pending_quote',
  Quoted = 'quoted',
  Approved = 'approved',
  Pending = 'pending',
  Confirmed = 'confirmed',
  InProgress = 'inProgress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  customerId: User | string;
  staffId?: User | string;
  serviceType: ServiceType;
  scheduledDate: string;
  scheduledTime: string;
  durationEstimate: number;
  address: Address;
  status: BookingStatus;
  stripePaymentIntentId?: string;
  amountCents: number;
  tipAmountCents: number;
  notes?: string;
  cancellationReason?: string;
  propertyDetails?: {
    floors?: number;
    workstations?: number;
    restrooms?: number;
    squareFootage?: number;
    privateOffices?: number;
    conferenceRooms?: number;
    kitchenettes?: number;
    condition: 'normal' | 'heavy' | 'extreme';
  };
  quotedAmountCents?: number;
  quotedAt?: string;
  quoteNotes?: string;
  customerApprovedAt?: string;
  customerDeclinedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  item: string;
  completed: boolean;
}

export interface Job {
  _id: string;
  bookingId: Booking | string;
  staffId: string;
  checkInTime?: string;
  checkOutTime?: string;
  checklist: ChecklistItem[];
  photosBefore: string[];
  photosAfter: string[];
  staffNotes?: string;
  customerSignOff: boolean;
  completedAt?: string;
}

export enum InvoiceStatus {
  Draft = 'draft',
  Sent = 'sent',
  Paid = 'paid',
  PartiallyRefunded = 'partially_refunded',
  Refunded = 'refunded',
}

export enum ChequeStatus {
  Received = 'received',
  Deposited = 'deposited',
  Cleared = 'cleared',
  Bounced = 'bounced',
}

export interface ChequePayment {
  _id: string;
  invoiceId: string;
  chequeNumber: string;
  bankName: string;
  drawerName: string;
  amountCents: number;
  dateOnCheque: string;
  dateReceived: string;
  dateDeposited?: string;
  dateCleared?: string;
  dateBounced?: string;
  status: ChequeStatus;
  bounceReason?: string;
  notes?: string;
  createdAt: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  bookingId: Booking | string;
  quotationId?: Quotation | string;
  customerId: User | string;
  lineItems: LineItem[];
  subtotalCents: number;
  taxRate: number;
  taxAmountCents: number;
  totalAmountCents: number;
  tipAmountCents: number;
  status: InvoiceStatus;
  paymentMethod?: 'stripe' | 'cheque';
  notes?: string;
  dueDate: string;
  stripePaymentIntentId?: string;
  chequePaymentId?: ChequePayment | string;
  pdfUrl?: string;
  sentAt?: string;
  paidAt?: string;
  createdAt: string;
}

export enum QuotationStatus {
  Draft = 'draft',
  Sent = 'sent',
  Accepted = 'accepted',
  Declined = 'declined',
  Expired = 'expired',
}

export interface Quotation {
  _id: string;
  quotationNumber: string;
  bookingId: Booking | string;
  customerId: User | string;
  lineItems: LineItem[];
  subtotalCents: number;
  taxRate: number;
  taxAmountCents: number;
  totalAmountCents: number;
  status: QuotationStatus;
  notes?: string;
  validUntil: string;
  sentAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  createdBy: User | string;
  createdAt: string;
}

export interface Receipt {
  _id: string;
  receiptNumber: string;
  invoiceId: Invoice | string;
  quotationId?: Quotation | string;
  bookingId?: Booking | string;
  customerId: User | string;
  lineItems: LineItem[];
  subtotalCents: number;
  taxRate: number;
  taxAmountCents: number;
  totalAmountCents: number;
  tipAmountCents: number;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  pdfUrl?: string;
  paidAt: string;
  createdAt: string;
}

export enum SubscriptionFrequency {
  Weekly = 'weekly',
  Biweekly = 'biweekly',
  Monthly = 'monthly',
}

export enum SubscriptionStatus {
  Active = 'active',
  Paused = 'paused',
  Cancelled = 'cancelled',
}

export interface Subscription {
  _id: string;
  customerId: string;
  frequency: SubscriptionFrequency;
  serviceType: string;
  preferredDay: string;
  preferredTime: string;
  address: Address;
  status: SubscriptionStatus;
  nextScheduledDate?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  _id: string;
  actorId: { email: string; role: string } | string;
  actorRole: string;
  action: string;
  targetCollection: string;
  targetId?: string;
  changedFields?: Record<string, unknown>;
  ipAddress: string;
  timestamp: string;
}

export interface Feedback {
  _id: string;
  bookingId: Booking | string;
  customerId: User | string;
  token: string;
  rating?: number;
  comment?: string;
  customerName: string;
  customerRole?: string;
  customerLocation?: string;
  serviceType: string;
  isPublic: boolean;
  submittedAt?: string;
  requestedAt: string;
  createdAt: string;
}

export interface Testimonial {
  _id: string;
  customerName: string;
  customerRole?: string;
  customerLocation?: string;
  serviceType: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pages: number;
  [key: string]: T[] | number;
}
