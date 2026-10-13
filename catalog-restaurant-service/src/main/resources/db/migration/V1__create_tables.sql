-- =============================================
-- V1 : Création des tables du Catalog Service
-- =============================================

CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(20),
    owner_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CLOSED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    restaurant_id UUID NOT NULL,
    CONSTRAINT fk_category_restaurant FOREIGN KEY (restaurant_id)
        REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    category_id UUID NOT NULL,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE CASCADE
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_restaurant_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurant_status ON restaurants(status);
CREATE INDEX idx_category_restaurant ON categories(restaurant_id);
CREATE INDEX idx_product_category ON products(category_id);
