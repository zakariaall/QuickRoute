ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cuisine VARCHAR(120);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

INSERT INTO restaurants (id, name, description, address, phone, owner_id, status, cuisine, image_url) VALUES
('a1000000-0000-4000-8000-000000000001', 'Dar Tajine', 'Tajines mijotés, couscous du vendredi et saveurs de la maison.', 'Maârif, Casablanca', '+212 522 000 101', '11111111-1111-4111-8111-111111111111', 'OPEN', 'Cuisine marocaine', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85'),
('a1000000-0000-4000-8000-000000000002', 'Bun & Co.', 'Burgers généreux, pain brioché et frites maison.', 'Gauthier, Casablanca', '+212 522 000 102', '11111111-1111-4111-8111-111111111111', 'OPEN', 'Burgers · Grill', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85'),
('a1000000-0000-4000-8000-000000000003', 'Casa Pasta', 'Pâtes fraîches et recettes simples, préparées avec soin.', 'Anfa, Casablanca', '+212 522 000 103', '11111111-1111-4111-8111-111111111111', 'OPEN', 'Italien · Pâtes', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85'),
('a1000000-0000-4000-8000-000000000004', 'Poke Corner', 'Bols colorés, ingrédients frais et sauces maison.', 'Racine, Casablanca', '+212 522 000 104', '11111111-1111-4111-8111-111111111111', 'OPEN', 'Poke · Frais', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85'),
('a1000000-0000-4000-8000-000000000005', 'La Petite Fournaise', 'Pâte levée lentement, garnitures de saison et cuisson au four.', 'Bourgogne, Casablanca', '+212 522 000 105', '11111111-1111-4111-8111-111111111111', 'OPEN', 'Pizza · Italien', 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=85'),
('a1000000-0000-4000-8000-000000000006', 'Yuki Sushi', 'Sushis préparés à la commande et produits soigneusement choisis.', 'CIL, Casablanca', '+212 522 000 106', '11111111-1111-4111-8111-111111111111', 'OPEN', 'Japonais · Sushi', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=85')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, restaurant_id) VALUES
('a2000000-0000-4000-8000-000000000001', 'Les incontournables', 'a1000000-0000-4000-8000-000000000001'),
('a2000000-0000-4000-8000-000000000002', 'Burgers maison', 'a1000000-0000-4000-8000-000000000002'),
('a2000000-0000-4000-8000-000000000003', 'Pâtes fraîches', 'a1000000-0000-4000-8000-000000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, description, price, available, image_url, category_id) VALUES
('a3000000-0000-4000-8000-000000000001', 'Tajine poulet citron confit', 'Poulet fermier, olives et citron confit. Servi avec du pain maison.', 78.00, TRUE, NULL, 'a2000000-0000-4000-8000-000000000001'),
('a3000000-0000-4000-8000-000000000002', 'Couscous aux sept légumes', 'Semoule légère, légumes de saison et bouillon parfumé.', 85.00, TRUE, NULL, 'a2000000-0000-4000-8000-000000000001'),
('a3000000-0000-4000-8000-000000000003', 'Le Classic', 'Steak grillé, cheddar, salade croquante et sauce maison.', 72.00, TRUE, NULL, 'a2000000-0000-4000-8000-000000000002'),
('a3000000-0000-4000-8000-000000000004', 'Penne crème champignons', 'Pâtes fraîches, champignons poêlés et parmesan.', 68.00, TRUE, NULL, 'a2000000-0000-4000-8000-000000000003')
ON CONFLICT (id) DO NOTHING;
