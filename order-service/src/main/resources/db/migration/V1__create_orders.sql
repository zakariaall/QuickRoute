-- =============================================
-- V1 : Migration Flyway pour Order Service
-- =============================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(255) NOT NULL,
    restaurant_id UUID NOT NULL,
    delivery_address VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
