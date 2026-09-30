package com.ecommerce.userservice.events;

public class UserDeletedEvent {

    private String userId;

    public UserDeletedEvent(String userId) {
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }
}