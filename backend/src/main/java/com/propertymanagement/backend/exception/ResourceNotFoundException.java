package com.propertymanagement.backend.exception;

public class ResourceNotFoundException
        extends RuntimeException {

    public ResourceNotFoundException(
            String message){

        super(message);
    }
}