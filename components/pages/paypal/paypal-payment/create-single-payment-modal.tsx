"use client";

// MARK: Import Dependencies
// Explanation: Imports all required form handling, validation, UI components, and API hooks.
// Uses React Hook Form for form management, Zod for schema validation, and custom hooks for API calls.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useCreateExcelData } from "@/lib/hooks/use-api";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// MARK: Form Validation Schema
// Explanation: Zod schema defining validation rules for the single payment creation form.
// Required fields: reservationId, amountToCharge, chargeStatus, cardNumber, cardExpire, cardCvv, softDescriptor
// Optional fields: All other hotel, guest, and reservation details for comprehensive record keeping
const formSchema = z.object({
  expediaId: z.string().optional(),
  batch: z.string().optional(),
  ota: z.string().optional(),
  postingType: z.string().optional(),
  portfolio: z.string().optional(),
  hotelName: z.string().optional(),
  reservationId: z.string().min(1, "Reservation ID is required"),
  hotelConfirmationCode: z.string().optional(),
  name: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  currency: z.string().optional(),
  amountToCharge: z.string().min(1, "Amount to charge is required"),
  chargeStatus: z.string().min(1, "Charge status is required"),
  cardNumber: z.string().min(1, "Card number is required"),
  cardExpire: z.string().min(1, "Card expire is required"),
  cardCvv: z.string().min(1, "Card CVV is required"),
  softDescriptor: z.string().min(1, "Soft descriptor is required"),
  vnpWorkId: z.string().optional(),
  status: z.string().optional(),
});

// MARK: Component Props Interface
// Explanation: Defines props for the Create Single Payment Modal component.
// open: Controls modal visibility
// onOpenChange: Callback for modal open/close state changes
// onSuccess: Optional callback executed after successful payment creation
interface CreateSinglePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// MARK: Create Single Payment Modal Component
// Explanation: Modal dialog for manually creating individual PayPal payment transactions.
// Provides comprehensive form with all necessary fields for hotel reservations, guest info, and payment details.
// Used when creating payments outside of bulk upload process for one-off transactions.
export default function CreateSinglePaymentModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateSinglePaymentModalProps) {
  // MARK: API Mutation Hook
  // Explanation: React Query mutation hook for creating single payment records via API
  const createExcelDataMutation = useCreateExcelData();

  // MARK: Form Initialization
  // Explanation: React Hook Form setup with Zod validation and default empty values.
  // Handles form state management, validation, and submission for all payment fields.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expediaId: "",
      batch: "",
      ota: "",
      postingType: "",
      portfolio: "",
      hotelName: "",
      reservationId: "",
      hotelConfirmationCode: "",
      name: "",
      checkIn: "",
      checkOut: "",
      currency: "",
      amountToCharge: "",
      chargeStatus: "",
      cardNumber: "",
      cardExpire: "",
      cardCvv: "",
      softDescriptor: "",
      vnpWorkId: "",
      status: "",
    },
  });

  // MARK: Form Submit Handler
  // Explanation: Processes form submission by mapping form values to API format and creating payment record.
  // Transforms camelCase field names to API-expected "Display Name" format.
  // Manual Flow: User fills form → Click Submit → Data mapped to API format → API call → Success callback → Modal closes
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Map form values to API format
      const apiData = {
        "Expedia ID": values.expediaId || "",
        "Batch": values.batch || "",
        "OTA": values.ota || "",
        "Posting Type": values.postingType || "",
        "Portfolio": values.portfolio || "",
        "Hotel Name": values.hotelName || "",
        "Reservation ID": values.reservationId || "",
        "Hotel Confirmation Code": values.hotelConfirmationCode || "",
        "Name": values.name || "",
        "Check In": values.checkIn || "",
        "Check Out": values.checkOut || "",
        "Curency": values.currency || "",
        "Amount to charge": values.amountToCharge || "",
        "Charge status": values.chargeStatus || "",
        "Card Number": values.cardNumber || "",
        "Card Expire": values.cardExpire || "",
        "Card CVV": values.cardCvv || "",
        "Soft Descriptor": values.softDescriptor || "",
        "VNP Work ID": values.vnpWorkId || "",
        "Status": values.status || "",
      };

      await createExcelDataMutation.mutateAsync(apiData);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error", error);
      // Error is handled by the mutation hook
    }
  }

  // MARK: Component Render
  // Explanation: Renders modal dialog with comprehensive payment creation form.
  // Form layout uses 2-column grid for efficient space utilization and organized field grouping.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Single Payment</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new payment record.
          </DialogDescription>
        </DialogHeader>

        {/* MARK: Payment Creation Form */}
        {/* Explanation: Comprehensive form with all fields for creating a manual payment transaction.
        Fields organized in 2-column grid covering: Booking info, Guest details, Payment info, Card details */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            {/* MARK: Form Fields Grid */}
            {/* Explanation: Two-column grid layout containing all payment form fields.
            Required fields marked with red asterisk (*): Reservation ID, Amount, Charge Status, Card details, Soft Descriptor */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expediaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expedia ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Expedia ID"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Batch" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTA</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter OTA Name"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posting Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Posting Type"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Portfolio Name Here"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hotelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Hotel Name Here"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reservationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservation ID <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Reservation ID"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hotelConfirmationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Confirmation Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Hotel Confirmation Code"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check In</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 2024-01-15"
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Out</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 2024-01-20"
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: John Doe" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: USD" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountToCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount to charge <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Amount Here"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chargeStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charge status <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Charge Status"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Card Number"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Must be a valid card</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardExpire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Expire <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 12/2025"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardCvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card CVV <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 123"
                        type="text"
                        maxLength={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="softDescriptor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soft Descriptor <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Soft Descriptor"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vnpWorkId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VNP Work ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: VNP123456"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="col-span-1 w-full">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a status from the list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ready to charge">Ready to charge</SelectItem>
                        <SelectItem value="Partially charged">Partially charged</SelectItem>
                        <SelectItem value="Charged">Charged</SelectItem>
                        <SelectItem value="Refunded">Refunded</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* MARK: Form Action Buttons */}
            {/* Explanation: Cancel and Submit buttons for form control.
            Cancel closes modal, Submit triggers validation and API call. Both disabled during submission. */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createExcelDataMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createExcelDataMutation.isPending}>
                {createExcelDataMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
