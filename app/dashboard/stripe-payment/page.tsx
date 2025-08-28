"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConnectedAccountsTab from "@/components/pages/stripe/connected-accounts/connected-accounts-tab";
import StripeTransactionsTab from "@/components/pages/stripe/stripe-transactions/stripe-transactions-tab";

export default function StripePaymentPage() {
  return (
    <div className="min-h-[80vh]">
      <Tabs defaultValue="connect-account" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 border border-gray-200 rounded-md">
          <TabsTrigger value="stripe-transactions" className="cursor-pointer">
            Stripe Transactions
          </TabsTrigger>
          <TabsTrigger value="connect-account" className="cursor-pointer">
            Connect Account
          </TabsTrigger>
        </TabsList>
        <TabsContent value="connect-account">
          <ConnectedAccountsTab />
        </TabsContent>
        <TabsContent value="stripe-transactions">
          <StripeTransactionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
