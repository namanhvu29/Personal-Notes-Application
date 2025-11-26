package FoundationProject.FoundationProject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FoundationProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(FoundationProjectApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner demo(
			FoundationProject.FoundationProject.repository.UsersRepository repository,
			org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
		return (args) -> {
			// Create 3 Admin accounts if not exist
			createAdminIfNotExist(repository, passwordEncoder, "admin1", "admin1@gmail.com");
			createAdminIfNotExist(repository, passwordEncoder, "admin2", "admin2@gmail.com");
			createAdminIfNotExist(repository, passwordEncoder, "admin3", "admin3@gmail.com");
		};
	}

	private void createAdminIfNotExist(
			FoundationProject.FoundationProject.repository.UsersRepository repository,
			org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
			String username, String email) {
		if (!repository.existsByUsername(username)) {
			FoundationProject.FoundationProject.entity.Users admin = new FoundationProject.FoundationProject.entity.Users();
			admin.setUsername(username);
			admin.setEmail(email);
			admin.setPassword(passwordEncoder.encode("123")); // Default password
			admin.setRole("ADMIN");
			repository.save(admin);
			System.out.println("Created Admin: " + username);
		}
	}
}
