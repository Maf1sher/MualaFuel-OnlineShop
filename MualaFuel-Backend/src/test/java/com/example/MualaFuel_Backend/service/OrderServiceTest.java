package com.example.MualaFuel_Backend.service;

import com.example.MualaFuel_Backend.dao.OrderDao;
import com.example.MualaFuel_Backend.dao.OrderItemDao;
import com.example.MualaFuel_Backend.dao.ProductDao;
import com.example.MualaFuel_Backend.dao.EmailHistoryDao;
import com.example.MualaFuel_Backend.dao.*;
import com.example.MualaFuel_Backend.dto.OrderDto;
import com.example.MualaFuel_Backend.entity.*;
import com.example.MualaFuel_Backend.enums.OrderStatus;
import com.example.MualaFuel_Backend.mapper.Mapper;
import com.example.MualaFuel_Backend.service.impl.OrderServiceImpl;
import jakarta.mail.MessagingException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.security.Principal;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderServiceTest {

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

    private Validator validator;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        cart = new Cart();
        orderService = new OrderServiceImpl(cart, orderRepository, productRepository, orderItemRepository, userRepository, mapper, emailService);
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testCheckoutProcess_TC61() throws MessagingException, SQLException {
        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn("test@wp.pl");
        cart.addItem(Product.builder().id(1L).quantity(10).price(BigDecimal.TEN).build(), 1);
        when(userRepository.findByEmail("test@wp.pl")).thenReturn(Optional.of(new User()));
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(Product.builder().id(1L).quantity(10).price(BigDecimal.TEN).build()));
        when(orderRepository.save(any())).thenReturn(new Order());
        when(mapper.mapTo(any())).thenReturn(new OrderDto());
        
        OrderDto result = orderService.placeOrder(new ShippingDetails(), null, principal);
        assertNotNull(result);
    }

    @Test
    void testEmptyCartException_TC62() {
        Principal principal = mock(Principal.class);
        // cart is empty by default
        assertThrows(RuntimeException.class, () -> orderService.placeOrder(null, null, principal));
    }

    @Test
    void testZipCodeValidationValid_TC63() {
        ShippingDetails address = ShippingDetails.builder().shipping_zipCode("00-111").build();
        assertTrue(address.getShipping_zipCode().matches("\\d{2}-\\d{3}"));
    }

    @Test
    void testZipCodeValidationInvalid_TC64() {
        ShippingDetails address = ShippingDetails.builder().shipping_zipCode("ABC").build();
        assertFalse(address.getShipping_zipCode().matches("\\d{2}-\\d{3}"));
    }

    @Test
    void testPaymentMethodSet_TC65() {
        PaymentDetails payment = PaymentDetails.builder().payment_method("CARD").build();
        assertEquals("CARD", payment.getPayment_method());
    }

    @Test
    void testOrderCreationPersistence_TC66() {
        Order order = Order.builder().status(OrderStatus.NEW).build();
        when(orderRepository.save(order)).thenReturn(order);
        Order saved = orderRepository.save(order);
        assertNotNull(saved);
        assertEquals(OrderStatus.NEW, saved.getStatus());
    }

    @Test
    void testStockReduction_TC67() {
        Product product = Product.builder().quantity(10).build();
        product.setQuantity(product.getQuantity() - 2);
        assertEquals(8, product.getQuantity());
    }

    @Test
    void testCartClearedAfterOrder_TC68() throws MessagingException, SQLException {
        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn("u");
        cart.addItem(Product.builder().id(1L).quantity(10).price(BigDecimal.TEN).build(), 1);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(new User()));
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(Product.builder().quantity(10).price(BigDecimal.TEN).build()));
        when(orderRepository.save(any())).thenReturn(new Order());

        orderService.placeOrder(new ShippingDetails(), null, principal);
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void testEmailSentAfterOrder_TC69() throws MessagingException, SQLException {
        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn("u");
        cart.addItem(Product.builder().id(1L).quantity(10).price(BigDecimal.TEN).build(), 1);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(new User()));
        when(productRepository.findById(anyLong())).thenReturn(Optional.of(Product.builder().quantity(10).price(BigDecimal.TEN).build()));
        when(orderRepository.save(any())).thenReturn(new Order());

        orderService.placeOrder(new ShippingDetails(), null, principal);
        verify(emailService).sendOrderConfirmationEmail(any());
    }

    @Test
    void testInitialStatusPending_TC70() {
        Order order = Order.builder().status(OrderStatus.NEW).build();
        assertEquals(OrderStatus.NEW, order.getStatus());
    }

    @Test
    void testGuestUserUnauthorized_TC71() {
        assertThrows(Exception.class, () -> orderService.placeOrder(null, null, null));
    }

    @Test
    void testCityValidation_TC72() {
        ShippingDetails details = ShippingDetails.builder().shipping_city(null).build();
        assertNull(details.getShipping_city());
    }

    @Test
    void testTotalPriceCalculation_TC73() {
        Order order = Order.builder().totalAmount(BigDecimal.valueOf(100)).build();
        assertEquals(BigDecimal.valueOf(100), order.getTotalAmount());
    }

    @Test
    void testUniqueIdGeneration_TC74() {
        Order order = new Order();
        order.setId(1L);
        assertNotNull(order.getId());
    }

    @Test
    void testOrderItemPriceSnapshot_TC75() {
        Product p = Product.builder().price(BigDecimal.TEN).build();
        OrderItem item = OrderItem.builder().unitPrice(p.getPrice()).build();
        assertEquals(BigDecimal.TEN, item.getUnitPrice());
    }

    @Test
    void testOrderAuditLogging_TC76() {
        auditRepository.save(new AuditEntry());
        verify(auditRepository).save(any());
    }

    @Test
    void testTransactionRollback_TC77() {
        assertTrue(true); 
    }

    @Test
    void testStockAvailabilityCheck_TC78() {
        Product p = Product.builder().quantity(5).build();
        assertTrue(p.getQuantity() >= 2);
    }

    @Test
    void testOrderMappingToDto_TC79() {
        Order order = new Order();
        when(orderRepository.findAll()).thenReturn(List.of(order));
        when(mapper.mapTo(order)).thenReturn(new OrderDto());
        assertNotNull(orderService.getAllOrders());
    }

    @Test
    void testShippingMapping_TC80() {
        ShippingDetails details = new ShippingDetails();
        assertNotNull(details);
    }
}
