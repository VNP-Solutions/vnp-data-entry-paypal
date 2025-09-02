"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConnectedAccountsTab from "@/components/pages/stripe/connected-accounts/connected-accounts-tab";
import StripeTransactionsTab from "@/components/pages/stripe/stripe-transactions/stripe-transactions-tab";
import StripeSettingsTab from "@/components/pages/stripe/stripe-settings/stripe-settings-tab";

export default function StripePaymentPage() {
  return (
    <div className="min-h-[80vh]">
      <Tabs defaultValue="stripe-transactions" className="w-full">
        <TabsList className="grid w-[600px] grid-cols-3 bg-white text-muted-foreground rounded-lg p-1 h-10">
          <TabsTrigger
            value="stripe-transactions"
            className="cursor-pointer transition-all duration-[200] data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:shadow-sm"
          >
            Stripe Transactions
          </TabsTrigger>
          <TabsTrigger
            value="connect-account"
            className="cursor-pointer transition-all duration-[200] data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:shadow-sm"
          >
            Connect Account
          </TabsTrigger>
          <TabsTrigger
            value="stripe-settings"
            className="cursor-pointer transition-all duration-[200] data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:shadow-sm"
          >
            Stripe Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="connect-account">
          <ConnectedAccountsTab />
        </TabsContent>
        <TabsContent value="stripe-transactions">
          <StripeTransactionsTab />
        </TabsContent>
        <TabsContent value="stripe-settings">
          <StripeSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
