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
public class ShippingDetails {
    @NotBlank(message = "Country is required")
    private String shipping_country;
    @NotBlank(message = "City is required")
    private String shipping_city;
    @NotBlank(message = "Zip code is required")
    private String shipping_zipCode;
    @NotBlank(message = "Street is required")
    private String shipping_street;
}
