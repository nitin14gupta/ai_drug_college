-- Drugs table to store unique medications
CREATE TABLE IF NOT EXISTS drugs (
    id TEXT PRIMARY KEY, -- DDInterID (e.g., DDInter1)
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interactions table to store pairwise interactions
CREATE TABLE IF NOT EXISTS interactions (
    id BIGSERIAL PRIMARY KEY,
    drug_a_id TEXT REFERENCES drugs(id),
    drug_b_id TEXT REFERENCES drugs(id),
    severity TEXT CHECK (severity IN ('Major', 'Moderate', 'Minor', 'Unknown')),
    description TEXT, -- If available in future datasets
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(drug_a_id, drug_b_id)
);

-- Patient Profiles for personalized risk scoring
CREATE TABLE IF NOT EXISTS patient_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    age INTEGER,
    sex TEXT,
    conditions JSONB DEFAULT '[]'::jsonb, -- e.g., ["Diabetes", "CKD"]
    lifestyle JSONB DEFAULT '{}'::jsonb, -- e.g., {"smoking": true, "alcohol": "moderate"}
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interactions_drug_a ON interactions(drug_a_id);
CREATE INDEX IF NOT EXISTS idx_interactions_drug_b ON interactions(drug_b_id);
CREATE INDEX IF NOT EXISTS idx_drugs_name ON drugs(name);

CREATE TABLE IF NOT EXISTS user_medications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    drug_id TEXT REFERENCES drugs(id),
    drug_name TEXT,
    dosage TEXT,
    frequency TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);