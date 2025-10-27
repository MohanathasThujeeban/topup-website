package com.example.topup.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.topup.demo")
public class TopupbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TopupbackendApplication.class, args);
	}

}
