package com.quickroute.catalog_restaurant.exception;

import java.util.UUID;

public class CategoryNotFoundException extends RuntimeException {

    public CategoryNotFoundException(UUID id) {
        super("Catégorie non trouvée avec l'ID : " + id);
    }
}
