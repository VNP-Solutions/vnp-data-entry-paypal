import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="mb-6">
            <svg
              className="mx-auto h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Awesome! Onboarding Complete
          </h1>
          <p className="text-gray-600">
            You have successfully finished the onboarding process for Stripe.
            Please proceed to the login page.
          </p>
          <p className="text-sm text-gray-500">
            If you encounter any issues, please contact us at{" "}
            <a
              href="mailto:itsupport@vnpsolutions.com"
              className="text-blue-600 hover:underline"
            >
              itsupport@vnpsolutions.com
            </a>
          </p>
          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
