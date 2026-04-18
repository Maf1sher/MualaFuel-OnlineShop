package com.example.MualaFuel_Backend.dto;

import com.example.MualaFuel_Backend.entity.PaymentDetails;
import com.example.MualaFuel_Backend.entity.ShippingDetails;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record OrderRequest(
        @NotNull(message = "Shipping details are required")
        @Valid
        ShippingDetails shippingDetails,
        @NotNull(message = "Payment details are required")
        @Valid
        PaymentDetails paymentDetails
) {}