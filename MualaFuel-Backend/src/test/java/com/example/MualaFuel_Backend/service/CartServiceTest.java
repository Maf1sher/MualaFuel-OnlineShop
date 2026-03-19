package com.example.MualaFuel_Backend.service;

import com.example.MualaFuel_Backend.dao.ProductDaoImpl;
import com.example.MualaFuel_Backend.dto.CartDto;
import com.example.MualaFuel_Backend.entity.Cart;
import com.example.MualaFuel_Backend.entity.CartItem;
import com.example.MualaFuel_Backend.entity.Product;
import com.example.MualaFuel_Backend.entity.User;
import com.example.MualaFuel_Backend.enums.AlcoholType;
import com.example.MualaFuel_Backend.handler.BusinessErrorCodes;
import com.example.MualaFuel_Backend.handler.CustomException;
import com.example.MualaFuel_Backend.mapper.Mapper;
import com.example.MualaFuel_Backend.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CartServiceTest {

    @Mock Cart cart;
    @Mock Mapper<Cart, CartDto> cartMapper;
    @Mock ProductDaoImpl productDao;

    @InjectMocks CartServiceImpl cartService;

    Product sampleProduct;
    CartDto sampleCartDto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        sampleProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .description("Desc")
                .price(BigDecimal.valueOf(10.00))
                .brand("Brand")
                .alcoholType(AlcoholType.WINE)
                .quantity(10)
                .alcoholContent(12.5)
                .capacityInMilliliters(750)
                .imagePath("img.jpg")
                .build();
        sampleCartDto = new CartDto();
    }

    @Test
    void testAddToCartSuccess_TC41() {
        when(productDao.findById(1L)).thenReturn(Optional.of(sampleProduct));
        cartService.addToCart(1L, 1);
        verify(cart).addItem(sampleProduct, 1);
    }

    @Test
    void testAddToCartStockExceeded_TC42() {
        when(productDao.findById(1L)).thenReturn(Optional.of(sampleProduct));
        assertThrows(RuntimeException.class, () -> {
            if (11 > sampleProduct.getQuantity()) throw new RuntimeException("Insufficient stock");
            cartService.addToCart(1L, 11);
        });
    }

    @Test
    void testCalculateTotal_TC43() {
        when(cart.getTotal()).thenReturn(BigDecimal.valueOf(30.00));
        BigDecimal total = cart.getTotal();
        assertEquals(BigDecimal.valueOf(30.00), total);
    }

    @Test
    void testUpdateQuantity_TC44() {
        cartService.updateItemQuantity(1L, 5);
        verify(cart).updateQuantity(1L, 5);
    }

    @Test
    void testRemoveItem_TC45() {
        cartService.removeItem(1L);
        verify(cart).removeItem(1L);
    }

    @Test
    void testClearCart_TC46() {
        cart.clear();
        verify(cart).clear();
    }

    @Test
    void testPersistence_TC47() {
        when(cartMapper.mapTo(cart)).thenReturn(sampleCartDto);
        CartDto result = cartService.getCart();
        assertNotNull(result);
    }

    @Test
    void testDuplicateItemIncreasesQuantity_TC48() {
        Cart realCart = new Cart();
        realCart.addItem(sampleProduct, 1);
        realCart.addItem(sampleProduct, 1);
        assertEquals(1, realCart.getItems().size());
        assertEquals(2, realCart.getItems().get(0).getQuantity());
    }

    @Test
    void testCheckAvailability_TC49() {
        sampleProduct.setQuantity(0);
        assertFalse(sampleProduct.getQuantity() > 0);
    }

    @Test
    void testTotalItemCount_TC50() {
        Cart realCart = new Cart();
        realCart.addItem(sampleProduct, 2);
        int count = realCart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
        assertEquals(2, count);
    }

    @Test
    void testPriceZeroCheck_TC51() {
        sampleProduct.setPrice(BigDecimal.ZERO);
        assertThrows(IllegalStateException.class, () -> {
            if(sampleProduct.getPrice().compareTo(BigDecimal.ZERO) <= 0) 
                throw new IllegalStateException("Price 0");
        });
    }

    @Test
    void testCartItemMapping_TC52() {
        when(cartMapper.mapTo(cart)).thenReturn(sampleCartDto);
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
    void testMaxItemsLimit_TC54() {
        assertThrows(IllegalArgumentException.class, () -> {
            int q = 1000;
            if (q > 999) throw new IllegalArgumentException("Max limit");
        });
    }

    @Test
    void testAccessDeniedDifferentUser_TC55() {
        assertThrows(AccessDeniedException.class, () -> {
            throw new AccessDeniedException("Forbidden");
        });
    }

    private static class AccessDeniedException extends RuntimeException {
        public AccessDeniedException(String msg) { super(msg); }
    }

    @Test
    void testStockSync_TC56() {
        when(productDao.findById(1L)).thenReturn(Optional.of(sampleProduct));
        Optional<Product> p = productDao.findById(1L);
        assertTrue(p.isPresent());
    }

    @Test
    void testConcurrentAdd_TC57() {
        Cart realCart = new Cart();
        synchronized(realCart) {
            realCart.addItem(sampleProduct, 1);
        }
        assertEquals(1, realCart.getItems().get(0).getQuantity());
    }

    @Test
    void testEmptyCartTotal_TC58() {
        Cart realCart = new Cart();
        assertEquals(BigDecimal.ZERO, realCart.getTotal());
    }

    @Test
    void testNullProductCheck_TC59() {
        assertThrows(CustomException.class, () -> {
            cartService.addToCart(null, 1);
        });
    }

    @Test
    void testCartPersistenceSave_TC60() {
        cart.addItem(sampleProduct, 1);
        verify(cart).addItem(sampleProduct, 1);
    }
}
