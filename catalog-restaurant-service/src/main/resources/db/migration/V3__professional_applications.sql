CREATE TABLE professional_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id VARCHAR(255) NOT NULL,
    application_type VARCHAR(20) NOT NULL CHECK (application_type IN ('RESTAURANT', 'DRIVER')),
    name VARCHAR(180) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address VARCHAR(500),
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(255)
);

CREATE INDEX idx_professional_applications_applicant ON professional_applications(applicant_id, created_at DESC);
CREATE INDEX idx_professional_applications_status ON professional_applications(status, created_at);
