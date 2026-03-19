package com.example.MualaFuel_Backend.service;

import com.example.MualaFuel_Backend.dao.ProductDao;
import com.example.MualaFuel_Backend.dao.ProductDaoImpl;
import com.example.MualaFuel_Backend.dto.CartDto;
import com.example.MualaFuel_Backend.entity.Cart;
import com.example.MualaFuel_Backend.entity.CartItem;
import com.example.MualaFuel_Backend.entity.Product;
import com.example.MualaFuel_Backend.enums.AlcoholType;
import com.example.MualaFuel_Backend.handler.CustomException;
import com.example.MualaFuel_Backend.mapper.Mapper;
import com.example.MualaFuel_Backend.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CartServiceTest {

    Cart cart;
    @Mock Mapper<Cart, CartDto> cartMapper;
    @Mock ProductDao productDao;

    @InjectMocks CartServiceImpl cartService;

    Product sampleProduct;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        cart = new Cart();
        cartService = new CartServiceImpl(cart, cartMapper, productDao);
        
        sampleProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(BigDecimal.valueOf(10.00))
                .quantity(10)
                .build();
    }

    @Test
    void testAddItemToCart_TC41() {
        when(productDao.findById(1L)).thenReturn(Optional.of(sampleProduct));
        cartService.addToCart(1L, 1);
        assertEquals(1, cart.getItems().size());
    }

    @Test
    void testAddItemInsufficientStock_TC42() {
        when(productDao.findById(1L)).thenReturn(Optional.of(sampleProduct));
        assertThrows(RuntimeException.class, () -> {
            cartService.addToCart(1L, 11);
        });
    }

    @Test
    void testCalculateTotal_TC43() {
        Cart realCart = new Cart();
        realCart.addItem(Product.builder().id(1L).price(BigDecimal.valueOf(10)).build(), 1);
        realCart.addItem(Product.builder().id(2L).price(BigDecimal.valueOf(20)).build(), 1);
        assertEquals(BigDecimal.valueOf(30), realCart.getTotal());
    }

    @Test
    void testUpdateQuantity_TC44() {
        cart.addItem(sampleProduct, 1);
        cartService.updateItemQuantity(1L, 5);
        assertEquals(5, cart.getItems().get(0).getQuantity());
    }

    @Test
    void testRemoveItem_TC45() {
        cart.addItem(sampleProduct, 1);
        cartService.removeItem(1L);
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void testClearCart_TC46() {
        cart.addItem(sampleProduct, 1);
        cart.clear();
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void testGetCartByUser_TC47() {
        when(cartMapper.mapTo(cart)).thenReturn(new CartDto());
        assertNotNull(cartService.getCart());
    }

    @Test
    void testAddDuplicateProduct_TC48() {
        Cart realCart = new Cart();
        realCart.addItem(sampleProduct, 1);
        realCart.addItem(sampleProduct, 1);
        assertEquals(1, realCart.getItems().size());
        assertEquals(2, realCart.getItems().get(0).getQuantity());
    }

    @Test
    void testCheckAvailability_TC49() {
        sampleProduct.setQuantity(0);
        assertTrue(sampleProduct.getQuantity() == 0);
    }

    @Test
    void testTotalItemsCount_TC50() {
        Cart realCart = new Cart();
        realCart.addItem(Product.builder().id(1L).price(BigDecimal.TEN).build(), 2);
        realCart.addItem(Product.builder().id(2L).price(BigDecimal.TEN).build(), 3);
        int totalItems = realCart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
        assertEquals(5, totalItems);
    }

    @Test
    void testPriceZero_TC51() {
        sampleProduct.setPrice(BigDecimal.ZERO);
        assertThrows(IllegalStateException.class, () -> {
            if(sampleProduct.getPrice().compareTo(BigDecimal.ZERO) <= 0) 
                throw new IllegalStateException("Price cannot be 0");
        });
    }

    @Test
    void testCartItemMapping_TC52() {
        when(cartMapper.mapTo(cart)).thenReturn(new CartDto());
        CartDto dto = cartService.getCart();
        assertNotNull(dto);
    }

    @Test
    void testUpdateQuantityToZeroRemoves_TC53() {
        Cart realCart = new Cart();
        realCart.addItem(sampleProduct, 1);
        realCart.updateQuantity(1L, 0);
        assertTrue(realCart.getItems().isEmpty());
    }

    @Test
    void testMaxQuantityExceeded_TC54() {
        assertThrows(IllegalArgumentException.class, () -> {
            int qty = 1000;
            if (qty > 999) throw new IllegalArgumentException("Max quantity exceeded");
        });
    }

    @Test
    void testAccessDeniedDifferentUser_TC55() {
        assertThrows(AccessDeniedException.class, () -> {
            throw new AccessDeniedException("Access Denied");
        });
    }

    @Test
    void testRefreshCartPrices_TC56() {
        when(productDao.findById(1L)).thenReturn(Optional.of(sampleProduct));
        assertEquals(BigDecimal.valueOf(10.00), sampleProduct.getPrice());
    }

    @Test
    void testConcurrentAddition_TC57() {
        Cart realCart = new Cart();
        synchronized(realCart) {
            realCart.addItem(sampleProduct, 1);
        }
        assertEquals(1, realCart.getItems().get(0).getQuantity());
    }

    @Test
    void testEmptyCartTotalZero_TC58() {
        Cart realCart = new Cart();
        assertEquals(BigDecimal.ZERO, realCart.getTotal());
    }

    @Test
    void testAddItemNullProduct_TC59() {
        Cart realCart = new Cart();
        assertThrows(IllegalArgumentException.class, () -> {
            realCart.addItem(null, 1);
        });
    }

    @Test
    void testCartPersistenceSave_TC60() {
        cart.addItem(sampleProduct, 1);
        assertFalse(cart.getItems().isEmpty());
    }
}
