package com.quickroute.catalog_restaurant.exception;

import java.util.UUID;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(UUID id) {
        super("Produit non trouvé avec l'ID : " + id);
    }
}
