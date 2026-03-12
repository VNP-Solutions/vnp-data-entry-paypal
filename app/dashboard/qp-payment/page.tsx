"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import QpPaymentPageComponent from "@/components/pages/qp/qp-payment";

function QpPaymentContent() {
  const searchParams = useSearchParams();
  const chargeFileId = searchParams.get("chargeFileId") ?? undefined;
  return <QpPaymentPageComponent initialChargeFileId={chargeFileId} />;
}

export default function QpPaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QpPaymentContent />
    </Suspense>
  );
}
