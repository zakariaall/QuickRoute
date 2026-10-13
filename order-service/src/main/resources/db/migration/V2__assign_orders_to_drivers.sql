ALTER TABLE orders ADD COLUMN driver_id VARCHAR(255);
CREATE INDEX idx_orders_driver_status ON orders(driver_id, status);
