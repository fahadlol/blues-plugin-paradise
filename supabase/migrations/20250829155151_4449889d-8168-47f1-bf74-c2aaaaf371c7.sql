-- Create policies table for legal documents
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type TEXT NOT NULL UNIQUE CHECK (policy_type IN ('privacy_policy', 'terms_of_service', 'refund_policy')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Everyone can view active policies
CREATE POLICY "Everyone can view active policies" 
ON public.policies 
FOR SELECT 
USING (is_active = true);

-- Only admins can manage policies
CREATE POLICY "Admins can manage policies" 
ON public.policies 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::app_role);

-- Create trigger to update updated_at
CREATE TRIGGER update_policies_updated_at
BEFORE UPDATE ON public.policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default policies
INSERT INTO public.policies (policy_type, title, content) VALUES 
('privacy_policy', 'Privacy Policy', 'This privacy policy outlines how we collect, use, and protect your personal information when you use our marketplace platform.

**Information We Collect:**
- Account information (email, name)
- Purchase history and transaction data
- Usage analytics and preferences

**How We Use Your Information:**
- Process orders and payments
- Provide customer support
- Improve our services
- Send important updates about your purchases

**Data Protection:**
We implement industry-standard security measures to protect your data. Your payment information is processed securely through encrypted channels.

**Your Rights:**
You can request access to, correction of, or deletion of your personal data by contacting our support team.

Contact us at support@marketplace.com for any privacy-related questions.'),

('terms_of_service', 'Terms of Service', 'By using our marketplace platform, you agree to these terms and conditions.

**Use of Service:**
- You must be 18+ years old to make purchases
- Provide accurate account information
- Use plugins in accordance with their individual licenses
- Do not share or redistribute purchased content

**Purchases and Payments:**
- All sales are final unless otherwise stated in our refund policy
- Prices are subject to change without notice
- You are responsible for applicable taxes

**Intellectual Property:**
- Plugins remain the property of their creators
- You receive a license to use, not ownership
- Respect copyright and licensing terms

**Prohibited Activities:**
- Reverse engineering or decompiling plugins
- Sharing login credentials
- Fraudulent transactions or chargebacks

**Limitation of Liability:**
We are not liable for damages arising from plugin use or service interruptions.

For questions, contact support@marketplace.com'),

('refund_policy', 'Refund Policy', 'We want you to be satisfied with your purchases. Here is our refund policy:

**30-Day Money Back Guarantee:**
- Request refunds within 30 days of purchase
- Valid reasons include technical issues, compatibility problems, or significant differences from description

**Refund Process:**
1. Contact support@marketplace.com with your order number
2. Describe the issue you''re experiencing
3. We''ll review your request within 2-3 business days
4. Approved refunds are processed within 5-7 business days

**Non-Refundable Items:**
- Downloads completed more than 30 days ago
- Custom development work
- Heavily discounted or promotional items

**How Refunds Work:**
- Refunds are issued to your original payment method
- Digital access will be revoked upon refund approval
- No partial refunds on bundle purchases

**Contact Information:**
For refund requests or questions, email support@marketplace.com with "Refund Request" in the subject line.');