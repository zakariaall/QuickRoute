package com.quickroute.order.repository;

import com.quickroute.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
import com.quickroute.order.model.OrderStatus;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByCustomerId(String customerId);
    List<Order> findByRestaurantId(UUID restaurantId);
    List<Order> findByStatusAndDriverIdIsNullOrderByCreatedAtAsc(OrderStatus status);
    List<Order> findByDriverIdAndStatusOrderByCreatedAtDesc(String driverId, OrderStatus status);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    java.util.Optional<Order> findByIdForUpdate(@Param("id") UUID id);
}
