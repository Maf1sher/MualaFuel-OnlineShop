package com.example.MualaFuel_Backend.entity;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Embeddable
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDetails {
    @NotBlank(message = "Payment method is required")
    private String payment_method;
    @NotBlank(message = "Payment status is required")
    private String payment_status;
    @NotBlank(message = "Transaction ID is required")
    private String payment_transactionId;
}
