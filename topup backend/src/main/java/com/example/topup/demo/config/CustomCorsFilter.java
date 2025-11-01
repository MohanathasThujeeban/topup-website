package com.example.topup.demo.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CustomCorsFilter implements Filter {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomCorsFilter.class);

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        logger.info("CORS Filter processing request: " + request.getMethod() + " " + request.getRequestURI());
        
        // Allow requests from these origins
        String origin = request.getHeader("Origin");
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            logger.debug("Setting Access-Control-Allow-Origin: " + origin);
        }

        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        response.setHeader("Access-Control-Max-Age", "3600");
        
        // Explicitly allow ALL headers including Authorization
        String requestHeaders = request.getHeader("Access-Control-Request-Headers");
        if (requestHeaders != null) {
            response.setHeader("Access-Control-Allow-Headers", requestHeaders);
        } else {
            response.setHeader("Access-Control-Allow-Headers", 
                "Authorization, Content-Type, Accept, Origin, X-Requested-With, Access-Control-Request-Method, Access-Control-Request-Headers");
        }
        
        response.setHeader("Access-Control-Expose-Headers", "Authorization, Content-Type, X-Requested-With");

        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            logger.info("Processing OPTIONS preflight request");
            response.setStatus(HttpServletResponse.SC_OK);
            return; // Important: we don't continue with the filter chain for OPTIONS
        }
        
        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Do nothing
    }

    @Override
    public void destroy() {
        // Do nothing
    }
}