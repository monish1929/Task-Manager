package com.example.task_manager.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

import io.jsonwebtoken.security.Keys;

@Service
public class JwtSecurity {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public SecretKey generateKey() {
        byte[] originalByte = Base64.getDecoder().decode(secret);

        SecretKey key = Keys.hmacShaKeyFor(originalByte);

        return key;
    }

    public String generatejwt(String username){
        Date now =new Date();
        Date expirydate=new Date(now.getTime()+expiration);
        return Jwts
                .builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expirydate)
                .signWith(generateKey())
                .compact();
    }
    public Claims extractAllClaims(String token){
        return Jwts
                .parser()
                .verifyWith(generateKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }
    public Date extractExpiration(String token){
        return extractAllClaims(token).getExpiration();
    }
    public boolean istokenexpired(String token){
        return extractExpiration(token).before(new Date());
    }
    public boolean validatetoken(String token,String username){
        String extracteduser=extractUsername(token);
        if(extracteduser.equals(username) && !istokenexpired(token)){
            return true;
        }
        return false;
    }
}