-- ===================================
-- MIGRATION 020: Settings Module & Payments
-- Add health insurances, products, and payment info to appointments
-- ===================================

-- 1. Create Payment Type Enum
CREATE TYPE payment_type AS ENUM ('particular', 'plano_saude');

-- 2. Create Health Insurances Table
CREATE TABLE health_insurances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_health_insurances_clinica ON health_insurances(clinica_id);

COMMENT ON TABLE health_insurances IS 'Health insurance providers accepted by the clinic';

-- 3. Create Insurance Products Table
CREATE TABLE insurance_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_id UUID NOT NULL REFERENCES health_insurances(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Básico", "Premium", "Apartamento"
  price DECIMAL(10, 2), -- Standard price for this product (optional)
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_insurance_products_insurance ON insurance_products(insurance_id);

COMMENT ON TABLE insurance_products IS 'Specific products/plans within a health insurance provider';

-- 4. Update Appointments Table
ALTER TABLE appointments
ADD COLUMN payment_type payment_type DEFAULT 'particular',
ADD COLUMN insurance_product_id UUID REFERENCES insurance_products(id) ON DELETE SET NULL,
ADD COLUMN price DECIMAL(10, 2); -- The actual price charged for this appointment

CREATE INDEX idx_appointments_insurance_product ON appointments(insurance_product_id);

-- 5. Enable RLS
ALTER TABLE health_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_products ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Health Insurances

-- View insurances: All authenticated users in the clinic
CREATE POLICY "Ver convênios da clínica"
  ON health_insurances FOR SELECT
  TO authenticated
  USING (clinica_id = public.user_clinica_id());

-- Manage insurances: Only Clinic Admins
CREATE POLICY "Gerenciar convênios da clínica"
  ON health_insurances FOR ALL
  TO authenticated
  USING (clinica_id = public.user_clinica_id() AND public.is_clinic_admin())
  WITH CHECK (clinica_id = public.user_clinica_id() AND public.is_clinic_admin());

-- 7. RLS Policies for Insurance Products

-- View products: All authenticated users in the clinic (via insurance -> clinica)
CREATE POLICY "Ver produtos de convênio"
  ON insurance_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM health_insurances
      WHERE health_insurances.id = insurance_products.insurance_id
        AND health_insurances.clinica_id = public.user_clinica_id()
    )
  );

-- Manage products: Only Clinic Admins
CREATE POLICY "Gerenciar produtos de convênio"
  ON insurance_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM health_insurances
      WHERE health_insurances.id = insurance_products.insurance_id
        AND health_insurances.clinica_id = public.user_clinica_id()
    )
    AND public.is_clinic_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM health_insurances
      WHERE health_insurances.id = insurance_products.insurance_id
        AND health_insurances.clinica_id = public.user_clinica_id()
    )
    AND public.is_clinic_admin()
  );

-- 8. Triggers for updated_at
CREATE TRIGGER update_health_insurances_updated_at BEFORE UPDATE ON health_insurances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_products_updated_at BEFORE UPDATE ON insurance_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
