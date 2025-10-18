package com.example.topup.demo.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class HttpTraceFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(HttpTraceFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        long startTime = System.currentTimeMillis();
        
        // Log the incoming request
        logger.info("Received request [{}] {} {}", 
                httpRequest.getMethod(),
                httpRequest.getRequestURI(),
                httpRequest.getQueryString() != null ? "?" + httpRequest.getQueryString() : "");
        
        // Log headers
        httpRequest.getHeaderNames().asIterator().forEachRemaining(headerName -> {
            logger.debug("Header: {} = {}", headerName, httpRequest.getHeader(headerName));
        });
        
        // Continue the filter chain
        chain.doFilter(request, response);
        
        // Log the response
        long endTime = System.currentTimeMillis();
        logger.info("Completed request [{}] {} with status {} in {} ms", 
                httpRequest.getMethod(),
                httpRequest.getRequestURI(),
                httpResponse.getStatus(),
                (endTime - startTime));
    }
}