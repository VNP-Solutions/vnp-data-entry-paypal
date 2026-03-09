"use client";

import { useSearchParams } from "next/navigation";
import QpPaymentPageComponent from "@/components/pages/qp/qp-payment";

export default function QpPaymentPage() {
  const searchParams = useSearchParams();
  const chargeFileId = searchParams.get("chargeFileId") ?? undefined;
  return <QpPaymentPageComponent initialChargeFileId={chargeFileId} />;
}
