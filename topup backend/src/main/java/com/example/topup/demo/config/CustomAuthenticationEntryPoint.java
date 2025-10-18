package com.example.topup.demo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationEntryPoint.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        
        logger.error("Unauthorized error: {}", authException.getMessage());
        
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_FORBIDDEN);
        body.put("error", "Forbidden");
        body.put("message", authException.getMessage());
        body.put("path", request.getServletPath());
        
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}