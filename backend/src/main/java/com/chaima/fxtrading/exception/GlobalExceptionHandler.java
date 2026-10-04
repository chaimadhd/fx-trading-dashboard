package com.chaima.fxtrading.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidationException(
            MethodArgumentNotValidException exception) {

        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage())
                );

        Map<String, Object> response = new HashMap<>();
        response.put("status", 400);
        response.put("message", "Validation failed");
        response.put("errors", errors);

        return response;
    }

    @ExceptionHandler(IllegalArgumentException.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
public Map<String, Object> handleNotFoundException(
        IllegalArgumentException exception) {

    Map<String, Object> response = new HashMap<>();
    response.put("status", 404);
    response.put("message", exception.getMessage());

    return response;
}

@ExceptionHandler(IllegalStateException.class)
@ResponseStatus(HttpStatus.CONFLICT)
public Map<String, Object> handleConflictException(
        IllegalStateException exception) {

    Map<String, Object> response = new HashMap<>();
    response.put("status", 409);
    response.put("message", exception.getMessage());

    return response;
}
}
