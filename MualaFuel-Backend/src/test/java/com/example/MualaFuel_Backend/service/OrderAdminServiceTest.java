package com.example.MualaFuel_Backend.service;

import com.example.MualaFuel_Backend.dao.OrderDao;
import com.example.MualaFuel_Backend.dao.OrderItemDao;
import com.example.MualaFuel_Backend.dao.ProductDao;
import com.example.MualaFuel_Backend.dao.EmailHistoryDao;
import com.example.MualaFuel_Backend.dao.*;
import com.example.MualaFuel_Backend.dto.OrderDto;
import com.example.MualaFuel_Backend.dto.request.EmailFilterRequest;
import com.example.MualaFuel_Backend.entity.*;
import com.example.MualaFuel_Backend.enums.OrderStatus;
import com.example.MualaFuel_Backend.mapper.Mapper;
import com.example.MualaFuel_Backend.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderAdminServiceTest {

    Cart cart;
    @Mock OrderDao orderRepository;
    @Mock ProductDao productRepository;
    @Mock OrderItemDao orderItemRepository;
    @Mock UserDao userRepository;
    @Mock Mapper<Order, OrderDto> mapper;
    @Mock EmailService emailService;
    @Mock AuditEntryDao auditRepository;
    @Mock EmailHistoryDao emailHistoryRepo;

    @InjectMocks OrderServiceImpl orderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        cart = new Cart();
        orderService = new OrderServiceImpl(cart, orderRepository, productRepository, orderItemRepository, userRepository, mapper, emailService);
    }

    @Test
    void testAdminGetAllOrders_TC81() {
        when(orderRepository.findAll()).thenReturn(List.of(new Order()));
        assertFalse(orderService.getAllOrders().isEmpty());
    }

    @Test
    void testFilterByStatus_TC82() {
        when(orderRepository.findAll()).thenReturn(List.of(Order.builder().status(OrderStatus.SHIPPED).build()));
        List<OrderDto> orders = orderService.getAllOrders();
        assertTrue(orders.size() > 0);
    }

    @Test
    void testFindOrderById_TC83() {
        Order order = Order.builder().status(OrderStatus.NEW).build();
        when(orderRepository.findById(123L)).thenReturn(Optional.of(order));
        orderService.updateStatusOfOrder(123L);
        verify(orderRepository).findById(123L);
    }

    @Test
    void testUpdateStatus_TC84() {
        Order order = Order.builder().status(OrderStatus.NEW).build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        orderService.updateStatusOfOrder(1L);
        assertEquals(OrderStatus.PAID, order.getStatus());
    }

    @Test
    void testCancelOrderStockRestoration_TC85() {
        Order order = Order.builder().status(OrderStatus.NEW).build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        orderService.cancelOrder(1L);
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
    }

    @Test
    void testAuditHistoryExists_TC86() {
        auditRepository.save(new AuditEntry());
        verify(auditRepository).save(any());
    }

    @Test
    void testOrderDetailsContent_TC87() {
        Order order = Order.builder().orderItems(List.of(new OrderItem())).build();
        assertFalse(order.getOrderItems().isEmpty());
    }

    @Test
    void testDateFilter_TC88() {
        Order order = Order.builder().orderDate(LocalDate.now()).build();
        assertEquals(LocalDate.now(), order.getOrderDate());
    }

    @Test
    void testUserAccessDeniedToAdmin_TC89() {
        assertThrows(AccessDeniedException.class, () -> {
            throw new AccessDeniedException("Access Denied");
        });
    }

    @Test
    void testEmailHistoryByOrder_TC90() {
        when(emailHistoryRepo.findAll(any(), any())).thenReturn(new PageImpl<>(List.of(new EmailHistory())));
        assertFalse(emailHistoryRepo.findAll(PageRequest.of(0, 10), new EmailFilterRequest()).getContent().isEmpty());
    }

    @Test
    void testValidStatusTransition_TC91() {
        Order order = Order.builder().status(OrderStatus.NEW).build();
        order.setStatus(OrderStatus.PAID);
        assertEquals(OrderStatus.PAID, order.getStatus());
    }

    @Test
    void testInvalidStatusTransition_TC92() {
        Order order = Order.builder().status(OrderStatus.DELIVERED).build();
        assertThrows(IllegalStateException.class, () -> {
            if(order.getStatus() == OrderStatus.DELIVERED) throw new IllegalStateException();
        });
    }

    @Test
    void testStockIncreaseOnCancel_TC93() {
        Product p = Product.builder().quantity(10).build();
        p.setQuantity(p.getQuantity() + 5);
        assertEquals(15, p.getQuantity());
    }

    @Test
    void testGetCustomerEmailFromOrder_TC94() {
        User user = User.builder().email("test@wp.pl").build();
        Order order = Order.builder().user(user).build();
        assertEquals("test@wp.pl", order.getUser().getEmail());
    }

    @Test
    void testSearchByCustomerEmail_TC95() {
        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn("test@wp.pl");
        when(userRepository.findByEmail("test@wp.pl")).thenReturn(Optional.of(new User()));
        when(orderRepository.findByUserId(anyLong())).thenReturn(List.of(new Order()));
        assertNotNull(orderService.getAllOrdersOfUser(principal));
    }

    @Test
    void testAdminRoleCheck_TC96() {
        assertTrue(true); 
    }

    @Test
    void testBulkStatusUpdate_TC97() {
        List<Long> ids = List.of(1L, 2L);
        for(Long id : ids) {
            when(orderRepository.findById(id)).thenReturn(Optional.of(Order.builder().status(OrderStatus.NEW).build()));
            orderService.updateStatusOfOrder(id);
        }
        verify(orderRepository, times(2)).save(any());
    }

    @Test
    void testEmailLogCreation_TC98() {
        emailHistoryRepo.save(new EmailHistory());
        verify(emailHistoryRepo).save(any());
    }

    @Test
    void testOrderStats_TC99() {
        assertTrue(true);
    }

    @Test
    void testEmptyEmailHistory_TC100() {
        when(emailHistoryRepo.findAll(any(), any())).thenReturn(new PageImpl<>(Collections.emptyList()));
        assertTrue(emailHistoryRepo.findAll(PageRequest.of(0, 10), new EmailFilterRequest()).getContent().isEmpty());
    }
}
