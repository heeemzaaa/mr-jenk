package com.ecommerce.apigateway.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.ServerRequest;

import com.ecommerce.apigateway.security.JwtAuthenticationFilter;

@Component
public class UserClaimsGatewayFilter {

    public ServerRequest apply(ServerRequest request) {

        String userId = (String) request.servletRequest()
                .getAttribute(JwtAuthenticationFilter.USER_ID_ATTRIBUTE);

        String role = (String) request.servletRequest()
                .getAttribute(JwtAuthenticationFilter.USER_ROLE_ATTRIBUTE);

        if (userId == null || role == null) {
            return request;
        }

        return ServerRequest.from(request)
                .headers(headers -> {
                    headers.remove("X-User-Id");
                    headers.remove("X-User-Role");

                    headers.add("X-User-Id", userId);
                    headers.add("X-User-Role", role);
                })
                .build();
    }
}