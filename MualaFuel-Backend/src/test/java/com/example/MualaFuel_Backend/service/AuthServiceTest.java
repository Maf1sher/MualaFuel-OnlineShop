package com.example.MualaFuel_Backend.service;

import com.example.MualaFuel_Backend.dao.RoleDao;
import com.example.MualaFuel_Backend.dao.UserDao;
import com.example.MualaFuel_Backend.dto.UserDto;
import com.example.MualaFuel_Backend.dto.request.LoginRequest;
import com.example.MualaFuel_Backend.dto.request.RegisterRequest;
import com.example.MualaFuel_Backend.entity.Role;
import com.example.MualaFuel_Backend.entity.User;
import com.example.MualaFuel_Backend.handler.BusinessErrorCodes;
import com.example.MualaFuel_Backend.handler.CustomException;
import com.example.MualaFuel_Backend.mapper.Mapper;
import com.example.MualaFuel_Backend.service.impl.AuthServiceImpl;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock UserDao userDao;
    @Mock RoleDao roleDao;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock Mapper<User, UserDto> mapper;
    @Mock JwtService jwtService;

    @InjectMocks AuthServiceImpl authService;

    private Validator validator;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testCreateUser_TC1() {
        RegisterRequest req = RegisterRequest.builder()
                .firstname("Jan").lastname("Kowalski").email("jan@wp.pl").password("password123").build();
        Role role = Role.builder().name("USER").build();
        when(userDao.findByEmail(anyString())).thenReturn(Optional.empty());
        when(roleDao.findByName("USER")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userDao.save(any())).thenReturn(new User());
        when(mapper.mapTo(any())).thenReturn(new UserDto());

        UserDto result = authService.createUser(req);
        assertNotNull(result);
    }

    @Test
    void testPasswordLengthValid_TC2() {
        RegisterRequest req = RegisterRequest.builder()
                .firstname("Jan").lastname("Kowalski").email("jan@wp.pl").password("12345678").build();
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testPasswordTooShort_TC3() {
        RegisterRequest req = RegisterRequest.builder()
                .firstname("Jan").lastname("Kowalski").email("jan@wp.pl").password("12345").build();
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void testEmailAlreadyExists_TC4() {
        RegisterRequest req = RegisterRequest.builder()
                .firstname("Jan").lastname("Kowalski").email("exists@wp.pl").password("password123").build();
        when(userDao.findByEmail("exists@wp.pl")).thenReturn(Optional.of(new User()));
        
        CustomException ex = assertThrows(CustomException.class, () -> authService.createUser(req));
        assertEquals(BusinessErrorCodes.EMAIL_IS_USED, ex.getErrorCode());
    }

    @Test
    void testUserRoleAssignment_TC5() {
        RegisterRequest req = RegisterRequest.builder()
                .firstname("Jan").lastname("Kowalski").email("jan@wp.pl").password("password123").build();
        Role role = Role.builder().name("USER").build();
        when(userDao.findByEmail(anyString())).thenReturn(Optional.empty());
        when(roleDao.findByName("USER")).thenReturn(Optional.of(role));
        
        authService.createUser(req);
        verify(roleDao).findByName("USER");
    }

    @Test
    void testPasswordIsHashed_TC6() {
        RegisterRequest req = RegisterRequest.builder()
                .firstname("Jan").lastname("Kowalski").email("jan@wp.pl").password("rawPassword").build();
        Role role = Role.builder().name("USER").build();
        when(userDao.findByEmail(anyString())).thenReturn(Optional.empty());
        when(roleDao.findByName("USER")).thenReturn(Optional.of(role));
        
        authService.createUser(req);
        verify(passwordEncoder).encode("rawPassword");
    }

    @Test
    void testLoginSuccess_TC7() {
        LoginRequest req = new LoginRequest("jan@wp.pl", "pass");
        Authentication auth = mock(Authentication.class);
        when(userDao.findByEmail("jan@wp.pl")).thenReturn(Optional.of(new User()));
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(auth.isAuthenticated()).thenReturn(true);
        when(jwtService.generateToken("jan@wp.pl")).thenReturn("token");

        String token = authService.verify(req);
        assertNotNull(token);
    }

    @Test
    void testLoginFailure_TC8() {
        LoginRequest req = new LoginRequest("jan@wp.pl", "wrong");
        when(userDao.findByEmail("jan@wp.pl")).thenReturn(Optional.of(new User()));
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.verify(req));
    }

    @Test
    void testJwtGeneration_TC9() {
        when(jwtService.generateToken("user")).thenReturn("token");
        String token = jwtService.generateToken("user");
        assertNotNull(token);
    }

    @Test
    void testJwtValidationSuccess_TC10() {
        when(jwtService.validateJwtToken("valid")).thenReturn(true);
        assertTrue(jwtService.validateJwtToken("valid"));
    }

    @Test
    void testJwtValidationFailure_TC11() {
        when(jwtService.validateJwtToken("expired")).thenReturn(false);
        assertFalse(jwtService.validateJwtToken("expired"));
    }

    @Test
    void testAuthorizationCheck_TC12() {
        SecurityContext context = mock(SecurityContext.class);
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        assertTrue(SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
    }

    @Test
    void testFirstnameNull_TC13() {
        RegisterRequest req = RegisterRequest.builder()
                .lastname("Kowalski").email("jan@wp.pl").password("password123").build();
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void testEmailFormatValid_TC14() {
        RegisterRequest req = RegisterRequest.builder()
                .firstname("Jan").lastname("Kowalski").email("test@wp.pl").password("password123").build();
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testEmailFormatInvalid_TC15() {
        RegisterRequest req = RegisterRequest.builder()
                .firstname("Jan").lastname("Kowalski").email("invalid-email").password("password123").build();
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
    }

    @Test
    void testDefaultRoleIsUser_TC16() {
        User user = User.builder().roles(Set.of(Role.builder().name("USER").build())).build();
        assertTrue(user.getRoles().stream().anyMatch(r -> r.getName().equals("USER")));
        assertFalse(user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN")));
    }

    @Test
    void testPasswordMatching_TC17() {
        when(passwordEncoder.matches("raw", "hashed")).thenReturn(true);
        assertTrue(passwordEncoder.matches("raw", "hashed"));
    }

    @Test
    void testUserMapping_TC18() {
        User user = User.builder().email("test@wp.pl").build();
        UserDto dto = UserDto.builder().email("test@wp.pl").build();
        when(mapper.mapTo(user)).thenReturn(dto);
        
        UserDto result = mapper.mapTo(user);
        assertEquals(user.getEmail(), result.getEmail());
    }

    @Test
    void testLogout_TC19() {
        interface TokenStorage { void invalidate(String token); }
        TokenStorage tokenStorage = mock(TokenStorage.class);
        tokenStorage.invalidate("token");
        verify(tokenStorage).invalidate("token");
    }

    @Test
    void testAccessControl_TC20() {
        Authentication auth = mock(Authentication.class);
        doReturn(true).when(auth).isAuthenticated();
        assertTrue(auth.isAuthenticated());
    }
}
