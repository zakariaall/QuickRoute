package com.quickroute.catalog_restaurant.exception;

import java.util.UUID;

public class RestaurantNotFoundException extends RuntimeException {

    public RestaurantNotFoundException(UUID id) {
        super("Restaurant non trouvé avec l'ID : " + id);
    }
}
