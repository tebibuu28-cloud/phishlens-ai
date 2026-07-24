export interface DemoSample {
  id: string;
  title: string;
  category: "Brand Impersonation" | "Financial Fraud" | "Malware Delivery" | "Identity Spoofing" | "Executive Fraud";
  description: string;
  emailContent: string;
}

export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: "microsoft-reset",
    title: "Microsoft 365 Password Reset",
    category: "Brand Impersonation",
    description: "Spoofed Microsoft security alert using a lookalike domain and artificial urgency to harvest login credentials.",
    emailContent: `From: Microsoft Security Team <support@micros0ft-security.com>
Subject: URGENT: Your Microsoft 365 Password Expires Today
Date: Fri, 24 Jul 2026 11:30:00 GMT

Dear Valued User,

We detected unauthorized login attempts from an unknown IP address on your Microsoft 365 account.
Your account will be permanently locked within 24 hours unless you verify immediately.

Please click here to reset password and confirm identity:
http://micros0ft-security.com/login-verify

Failure to respond will result in immediate account suspension.

Microsoft Security Operations Center`,
  },
  {
    id: "bank-alert",
    title: "Bank Account Fraud Warning",
    category: "Financial Fraud",
    description: "Fake banking alert threatening account suspension with a suspicious credential harvesting link.",
    emailContent: `From: Chase Online Security <alerts@chase-security-verify.com>
Subject: Security Alert: Account Suspended Due to Unusual Activity
Date: Fri, 24 Jul 2026 12:15:00 GMT

Dear Customer,

Your online banking access has been restricted due to multiple failed login attempts.
To restore full access to your bank details, you must verify account ownership immediately.

Login to confirm your identity:
http://chase-security-verify.com/login

Do not ignore this message. Your account will be frozen within 24 hours.

Chase Fraud Department`,
  },
  {
    id: "dhl-delivery",
    title: "Fake DHL Package Delivery Notice",
    category: "Malware Delivery",
    description: "Fake shipping alert containing a malicious script attachment payload disguised as a delivery receipt.",
    emailContent: `From: DHL Express Tracking <delivery@dhl-express-dispatch.com>
Subject: Action Required: Undeliverable Package #DHL-948271
Attachment: shipping_receipt.exe
Content-Disposition: attachment; filename="shipping_receipt.zip"
Date: Fri, 24 Jul 2026 09:45:00 GMT

Hello Customer,

We were unable to deliver your package today due to an incorrect street address.
Please review the attached file shipping_receipt.zip and shipping_receipt.exe for updated tracking information.

Or track online:
http://192.168.1.105/dhl/track

Please resolve within 24 hours to avoid package return.

DHL Logistics`,
  },
  {
    id: "paypal-invoice",
    title: "Fake PayPal Payment Dispute",
    category: "Financial Fraud",
    description: "Fraudulent invoice claim with a fake phone support number and malicious payment link.",
    emailContent: `From: PayPal Billing Department <service@paypal-dispute-notice.com>
Subject: Invoice Paid: $849.99 for Apple iPhone 15 Pro
Date: Fri, 24 Jul 2026 10:00:00 GMT

Dear Customer,

Thank you for your recent purchase. An unrecognized charge of $849.99 was successfully billed to your account.

If you did not authorize this payment, please call our toll-free support line immediately:
+1 (800) 555-0199

Or open a dispute online:
http://bit.ly/paypal-dispute-claim

Thank you for using PayPal.`,
  },
  {
    id: "google-workspace",
    title: "Google Workspace Security Warning",
    category: "Identity Spoofing",
    description: "Display name spoofing impersonating Google Workspace with obfuscated shortened bit.ly URL.",
    emailContent: `From: Google Cloud Support <admin-workspace@g00gle-security.com>
Subject: Critical Security Update Required for Google Workspace
Date: Fri, 24 Jul 2026 13:00:00 GMT

Hello Administrator,

A critical security vulnerability was discovered in your domain settings.
Immediate action required: please verify account credentials to prevent service interruption.

Verify now:
http://t.co/google-verify-admin

Thank you,
Google Workspace Admin Team`,
  },
  {
    id: "ceo-fraud",
    title: "CEO Urgent Wire Transfer Request",
    category: "Executive Fraud",
    description: "Executive impersonation with display name spoofing, mismatched Reply-To header, and urgent transfer demand.",
    emailContent: `From: Chief Executive Officer <john.ceo.company@gmail.com>
Reply-To: executive-finance@external-hacker.com
Subject: URGENT: Confidential Wire Transfer Needed Today
Date: Fri, 24 Jul 2026 08:30:00 GMT

Hi,

I am currently in an executive board meeting and cannot take calls.
I need you to process an urgent wire transfer for an overdue invoice to a new vendor immediately.

Please confirm once done so I can send the invoice details.
Kindly keep this confidential.

Best,
John Doe
CEO, Company Inc.`,
  },
];
