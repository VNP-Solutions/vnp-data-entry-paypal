import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function OnboardingRetryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Link Expired</h1>
          <p className="text-gray-600">
            Please inform the admin that you need to get a new link. This issue
            occurs because:
          </p>
          <ul className="text-gray-600 list-disc text-left pl-8 py-2">
            <li>Links expire after 30 minutes</li>
            <li>The page was refreshed during the process</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Contact admin at{" "}
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
