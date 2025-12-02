-- Create financial_categories table
CREATE TABLE financial_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'pix', 'cash', 'bank_slip', 'insurance', 'other')),
    days_to_receive INTEGER DEFAULT 0,
    fee_percentage DECIMAL(5, 2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_transactions table
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
    category_id UUID REFERENCES financial_categories(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    transaction_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
    appointment_id UUID REFERENCES appointments(id),
    patient_id UUID REFERENCES pacientes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for financial_categories
CREATE POLICY "Users can view categories from their clinic"
    ON financial_categories FOR SELECT
    USING (clinica_id = (SELECT clinica_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage categories"
    ON financial_categories FOR ALL
    USING (
        clinica_id = (SELECT clinica_id FROM users WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('clinic_admin', 'super_admin')
        )
    );

-- Policies for payment_methods
CREATE POLICY "Users can view payment methods from their clinic"
    ON payment_methods FOR SELECT
    USING (clinica_id = (SELECT clinica_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage payment methods"
    ON payment_methods FOR ALL
    USING (
        clinica_id = (SELECT clinica_id FROM users WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('clinic_admin', 'super_admin')
        )
    );

-- Policies for financial_transactions
CREATE POLICY "Users can view transactions from their clinic"
    ON financial_transactions FOR SELECT
    USING (clinica_id = (SELECT clinica_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage transactions"
    ON financial_transactions FOR ALL
    USING (
        clinica_id = (SELECT clinica_id FROM users WHERE id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('clinic_admin', 'super_admin')
        )
    );
