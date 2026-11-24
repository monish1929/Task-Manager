package com.example.task_manager.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtSecurity jwtSecurity;
    private final CustomUserDetailsService customUserDetailsService;
    public JwtFilter(JwtSecurity jwtSecurity, CustomUserDetailsService customUserDetailsService){
        this.jwtSecurity=jwtSecurity;
        this.customUserDetailsService=customUserDetailsService;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtSecurity.extractUsername(token);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                if (jwtSecurity.validatetoken(token, userDetails.getUsername()) && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        catch (JwtException | IllegalArgumentException e){
            SecurityContextHolder.clearContext();
        }


        filterChain.doFilter(request,response);
    }

}
