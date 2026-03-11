export interface QPChargeInstance {
  _id: string;
  charge_file_id: string;
  parent_file_name: string;
  row_number: number;
  ota: string;
  vnp_work_id: string;
  portfolio: string;
  hotel_id: string;
  reservation_id: string;
  amount_numeric: number;
  currency: string;
  user_id: string;
  billing_address: {
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postal_code: string;
    country_code: string;
  };
  card_last4: string;
  status: string;
  status_reason?: string | null;
  expiry_month?: number;
  expiry_year?: number;
  last_response_payload?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowData: QPChargeInstance | null;
}
