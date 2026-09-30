package com.ecommerce.apigateway.config;

import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class GatewayRoutesConfig {

    private final UserClaimsGatewayFilter userClaimsGatewayFilter;

    public GatewayRoutesConfig(
            UserClaimsGatewayFilter userClaimsGatewayFilter) {
        this.userClaimsGatewayFilter = userClaimsGatewayFilter;
    }

    @Bean
    public RouterFunction<ServerResponse> gatewayRoutes() {

        RouterFunction<ServerResponse> userServiceRoute =
                route("user-service-route")
                        .route(
                                request -> request.path().startsWith("/auth/") ||
                                 request.path().equals("/MyProfile"),
                                http()
                        )
                        .before(userClaimsGatewayFilter::apply)
                        .filter(lb("user-service"))
                        .build();

        RouterFunction<ServerResponse> productServiceRoute =
                route("product-service-route")
                        .route(
                                request -> request.path().startsWith("/products"),
                                http()
                        )
                        .before(userClaimsGatewayFilter::apply)
                        .filter(lb("product-service"))
                        .build();

        RouterFunction<ServerResponse> mediaServiceRoute =
                route("media-service-route")
                        .route(
                                request -> request.path().startsWith("/media"),
                                http()
                        )
                        .before(userClaimsGatewayFilter::apply)
                        .filter(lb("media-service"))
                        .build();

        return userServiceRoute
                .and(productServiceRoute)
                .and(mediaServiceRoute);
    }
}