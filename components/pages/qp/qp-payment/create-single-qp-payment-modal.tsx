"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/client-api-call";
import { toast } from "sonner";

const formSchema = z.object({
  hotel_id: z.string().min(1, "Expedia ID / Hotel ID is required"),
  reservation_id: z.string().min(1, "Reservation ID is required"),
  amount_numeric: z.string().min(1, "Amount is required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Amount must be a positive number"),
  currency: z.string().min(1, "Currency is required").length(3, "Use 3-letter code (e.g. USD)"),
  card_number: z.string().min(13, "Card number is required"),
  card_expire: z.string().min(1, "Card expire (MM/YY) is required"),
  cvv: z.string().min(3, "CVV is required").regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country_code: z.string().optional(),
  ota: z.string().optional(),
  vnp_work_id: z.string().optional(),
  portfolio: z.string().optional(),
  user_id: z.string().min(1, "QP Username is required"),
  ota_billing_name: z.string().min(1, "OTA Billing Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSingleQpPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateSingleQpPaymentModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateSingleQpPaymentModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hotel_id: "",
      reservation_id: "",
      amount_numeric: "",
      currency: "USD",
      card_number: "",
      card_expire: "",
      cvv: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postal_code: "",
      country_code: "US",
      ota: "",
      vnp_work_id: "",
      portfolio: "",
      user_id: "",
      ota_billing_name: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await apiClient.createAndProcessSingleQPCharge({
        hotel_id: values.hotel_id.trim(),
        reservation_id: values.reservation_id.trim(),
        amount_numeric: parseFloat(values.amount_numeric),
        currency: values.currency.trim().toUpperCase(),
        card_number: values.card_number.replace(/\s/g, ""),
        card_expire: values.card_expire.trim(),
        cvv: values.cvv.trim(),
        billing_address: {
          address_1: values.address_1 || undefined,
          address_2: values.address_2 || undefined,
          city: values.city || undefined,
          state: values.state || undefined,
          postal_code: values.postal_code || undefined,
          country_code: (values.country_code || "US").toUpperCase().slice(0, 2),
        },
        ota: values.ota || undefined,
        vnp_work_id: values.vnp_work_id || undefined,
        portfolio: values.portfolio || undefined,
        user_id: values.user_id.trim(),
        ota_billing_name: values.ota_billing_name.trim(),
      });
      toast.success("Charge created and processed");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to create and process charge";
      toast.error(String(msg));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[32rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Single Payment</DialogTitle>
          <DialogDescription>
            Enter payment details to create and charge a single QP transaction.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hotel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expedia ID / Hotel ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Hotel ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reservation_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservation ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Reservation ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount_numeric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
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
                    <FormLabel>Currency *</FormLabel>
                    <FormControl>
                      <Input placeholder="USD" maxLength={3} className="uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="card_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Card number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="card_expire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card expire (MM/YY) *</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="123" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Address 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Address 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country (2-letter)</FormLabel>
                    <FormControl>
                      <Input placeholder="US" maxLength={2} className="uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTA</FormLabel>
                    <FormControl>
                      <Input placeholder="OTA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vnp_work_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VNP Work ID</FormLabel>
                    <FormControl>
                      <Input placeholder="VNP Work ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio</FormLabel>
                  <FormControl>
                    <Input placeholder="Portfolio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>QP Username *</FormLabel>
                    <FormControl>
                      <Input placeholder="QP Username (terminal lookup)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ota_billing_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTA Billing Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="OTA Billing Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create and charge</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
