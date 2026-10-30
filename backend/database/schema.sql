PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN','USER','NGO','SHELTER')),
  account_status TEXT NOT NULL DEFAULT 'Active' CHECK (account_status IN ('Active','Inactive')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('NGO','SHELTER')),
  registration_number TEXT NOT NULL UNIQUE,
  year_established INTEGER NOT NULL,
  description TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  designation TEXT NOT NULL DEFAULT '',
  official_email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'Pending' CHECK (verification_status IN ('Pending','Approved','Rejected')),
  verification_date TEXT,
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS organization_documents (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('registrationCertificate','authorizedPersonId','addressProof')),
  document_url TEXT NOT NULL,
  storage_public_id TEXT,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (organization_id, document_type),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rescue_reports (
  id TEXT PRIMARY KEY,
  report_number TEXT NOT NULL UNIQUE,
  reported_by TEXT,
  tracking_token_hash TEXT NOT NULL UNIQUE,
  reporter_name TEXT NOT NULL,
  reporter_mobile TEXT NOT NULL,
  reporter_email TEXT,
  animal_type TEXT NOT NULL,
  breed TEXT NOT NULL DEFAULT '',
  age TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'Unknown',
  condition TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  image_public_id TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  date_found TEXT NOT NULL,
  additional_information TEXT,
  status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (status IN ('Pending Review','Under Review','NGO Assigned','Rescue Accepted','Rescue In Progress','Animal Rescued','Pet Profile Created','Closed')),
  assigned_organization_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  rescue_report_id TEXT UNIQUE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL DEFAULT '',
  age TEXT NOT NULL DEFAULT 'Unknown',
  age_value TEXT NOT NULL DEFAULT '',
  age_unit TEXT NOT NULL DEFAULT 'years' CHECK (age_unit IN ('months','years')),
  age_approximate TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'Unknown',
  size TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  rescue_story TEXT NOT NULL,
  personality TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(personality)),
  activity_level TEXT NOT NULL DEFAULT '',
  good_with_children INTEGER CHECK (good_with_children IS NULL OR good_with_children IN (0,1)),
  good_with_dogs INTEGER CHECK (good_with_dogs IS NULL OR good_with_dogs IN (0,1)),
  good_with_cats INTEGER CHECK (good_with_cats IS NULL OR good_with_cats IN (0,1)),
  good_with_strangers INTEGER CHECK (good_with_strangers IS NULL OR good_with_strangers IN (0,1)),
  vaccinated INTEGER CHECK (vaccinated IS NULL OR vaccinated IN (0,1)),
  sterilized INTEGER CHECK (sterilized IS NULL OR sterilized IN (0,1)),
  medical_condition TEXT NOT NULL,
  special_needs TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  adoption_status TEXT NOT NULL DEFAULT 'Available' CHECK (adoption_status IN ('Available','Under Adoption','Adopted')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT,
  FOREIGN KEY (rescue_report_id) REFERENCES rescue_reports(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pet_images (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_public_id TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS adoption_applications (
  id TEXT PRIMARY KEY,
  application_number TEXT NOT NULL UNIQUE,
  pet_id TEXT NOT NULL,
  adopter_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  reason TEXT NOT NULL,
  housing_type TEXT NOT NULL,
  pet_experience TEXT NOT NULL,
  has_other_pets INTEGER NOT NULL DEFAULT 0 CHECK (has_other_pets IN (0,1)),
  other_pets_details TEXT NOT NULL,
  primary_caregiver TEXT NOT NULL,
  additional_information TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted','Under Review','Approved','Rejected','Completed')),
  rejection_reason TEXT,
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
  FOREIGN KEY (adopter_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT CHECK (details IS NULL OR json_valid(details)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, account_status);
CREATE INDEX IF NOT EXISTS idx_organizations_verification ON organizations (verification_status, created_at);
CREATE INDEX IF NOT EXISTS idx_documents_organization ON organization_documents (organization_id);
CREATE INDEX IF NOT EXISTS idx_rescue_status_created ON rescue_reports (status, created_at);
CREATE INDEX IF NOT EXISTS idx_rescue_assigned_org_status ON rescue_reports (assigned_organization_id, status);
CREATE INDEX IF NOT EXISTS idx_pets_public_status ON pets (is_active, adoption_status, species);
CREATE INDEX IF NOT EXISTS idx_pets_location ON pets (city, state);
CREATE INDEX IF NOT EXISTS idx_pets_organization ON pets (organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pet_images_pet_order ON pet_images (pet_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_applications_adopter ON adoption_applications (adopter_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_applications_org_status ON adoption_applications (organization_id, status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_applications_pet_status ON adoption_applications (pet_id, status);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_expiry ON refresh_tokens (user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_type, entity_id, created_at);

CREATE TRIGGER IF NOT EXISTS update_users_timestamp AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS update_organizations_timestamp AFTER UPDATE ON organizations
BEGIN
  UPDATE organizations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS update_rescue_reports_timestamp AFTER UPDATE ON rescue_reports
BEGIN
  UPDATE rescue_reports SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS update_pets_timestamp AFTER UPDATE ON pets
BEGIN
  UPDATE pets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS update_adoption_applications_timestamp AFTER UPDATE ON adoption_applications
BEGIN
  UPDATE adoption_applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
