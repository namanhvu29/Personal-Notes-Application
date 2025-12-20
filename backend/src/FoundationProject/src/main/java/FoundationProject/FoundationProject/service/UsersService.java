package FoundationProject.FoundationProject.service;

import FoundationProject.FoundationProject.controller.UsersUpdateRequest;
import FoundationProject.FoundationProject.dto.request.UsersCreationRequest;
import FoundationProject.FoundationProject.dto.request.UsersRegisterRequest;
import FoundationProject.FoundationProject.dto.request.ForgotPasswordRequest;
import FoundationProject.FoundationProject.dto.request.VerifyResetCodeRequest;
import FoundationProject.FoundationProject.dto.request.ResetPasswordRequest;
import FoundationProject.FoundationProject.entity.Users;
import FoundationProject.FoundationProject.entity.PasswordResetToken;
import FoundationProject.FoundationProject.repository.UsersRepository;
import FoundationProject.FoundationProject.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.regex.Pattern;

@Service
public class UsersService implements org.springframework.security.core.userdetails.UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    // ĐĂNG KÝ NGƯỜI DÙNG
    public void register(UsersRegisterRequest request) {
        // Kiểm tra dữ liệu trống
        if (request.getUsername() == null || request.getUsername().isEmpty() ||
                request.getEmail() == null || request.getEmail().isEmpty() ||
                request.getPassword() == null || request.getPassword().isEmpty() ||
                request.getConfirmPassword() == null || request.getConfirmPassword().isEmpty()) {
            throw new IllegalArgumentException("Thiếu thông tin đăng ký!");
        }

        // Kiểm tra trùng username/email
        if (usersRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại!");
        }
        if (usersRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng!");
        }

        // Kiểm tra password == confirm
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp!");
        }

        // Kiểm tra độ mạnh mật khẩu
        if (!isValidPassword(request.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu phải ≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt!");
        }

        // Mã hóa & lưu vào DB
        Users newUser = new Users();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole("USER"); // Force USER role
        usersRepository.save(newUser);
    }

    private boolean isValidPassword(String password) {
        // Regex: >=8 ký tự, có ít nhất 1 chữ thường, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
        String pattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[~!@#$%^&*()_+\\-={}\\[\\]|:;\"'<>,.?/]).{8,}$";
        return Pattern.compile(pattern).matcher(password).matches();
    }

    // dang nhap
    public Users findByUsernameOrEmail(String usernameOrEmail) {
        Users user = usersRepository.findByUsername(usernameOrEmail);
        if (user == null) {
            user = usersRepository.findByEmail(usernameOrEmail);
        }
        return user;
    }

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username)
            throws org.springframework.security.core.userdetails.UsernameNotFoundException {
        Users user = usersRepository.findByUsername(username);
        if (user == null) {
            throw new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found");
        }

        // Convert role to Authority
        String role = user.getRole();
        if (role == null || role.isEmpty()) {
            role = "USER";
        }
        // Ensure role starts with ROLE_ if using hasRole, or just use as is if using
        // hasAuthority
        // Standard practice: ROLE_ADMIN, ROLE_USER. But let's stick to simple strings
        // if config uses hasAuthority or manual check.
        // For hasRole("ADMIN"), Spring expects "ROLE_ADMIN".
        // Let's assume we store "ADMIN" and "USER" in DB.

        java.util.List<org.springframework.security.core.GrantedAuthority> authorities = java.util.Collections
                .singletonList(
                        new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities);
    }

    // CRUD
    public Users createUsers(UsersCreationRequest request) {
        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setRole("USER");
        return usersRepository.save(user);
    }

    public Users updateUsers(int usersId, UsersUpdateRequest request) {
        Users user = getUsersById(usersId);
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        return usersRepository.save(user);
    }

    public void deleteUser(int usersId) {
        usersRepository.deleteById(usersId);
    }

    public List<Users> getUsers() {
        return usersRepository.findAll();
    }

    public Users getUsersById(int id) {
        return usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ========================================
    // FORGOT PASSWORD - 3 STEPS
    // ========================================

    // BƯỚC 1: Gửi mã reset qua email
    @Transactional
    public void sendResetCode(ForgotPasswordRequest request) {
        String email = request.getEmail();

        // Kiểm tra email có tồn tại không
        Users user = usersRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("Email không tồn tại trong hệ thống!");
        }

        // Xóa các token cũ của email này (nếu có)
        resetTokenRepository.deleteByEmail(email);

        // Tạo mã 6 số ngẫu nhiên
        String resetCode = String.format("%06d", new Random().nextInt(999999));

        // Lưu token vào DB
        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setResetCode(resetCode);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(10)); // Hết hạn sau 10 phút
        token.setUsed(false);
        resetTokenRepository.save(token);

        // Gửi email
        emailService.sendResetCode(email, resetCode);
    }

    // BƯỚC 2: Xác thực mã
    public void verifyResetCode(VerifyResetCodeRequest request) {
        PasswordResetToken token = resetTokenRepository
                .findByEmailAndResetCodeAndUsedFalse(request.getEmail(), request.getCode())
                .orElseThrow(() -> new IllegalArgumentException("Mã xác thực không đúng hoặc đã được sử dụng!"));

        // Kiểm tra hết hạn
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã xác thực đã hết hạn!");
        }
    }

    // BƯỚC 3: Đặt lại mật khẩu
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Kiểm tra mật khẩu mới và xác nhận
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp!");
        }

        // Kiểm tra độ mạnh mật khẩu
        if (!isValidPassword(request.getNewPassword())) {
            throw new IllegalArgumentException("Mật khẩu phải ≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt!");
        }

        // Lấy token và kiểm tra
        PasswordResetToken token = resetTokenRepository
                .findByEmailAndResetCodeAndUsedFalse(request.getEmail(), request.getCode())
                .orElseThrow(() -> new IllegalArgumentException("Mã xác thực không hợp lệ!"));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã xác thực đã hết hạn!");
        }

        // Lấy user và cập nhật mật khẩu
        Users user = usersRepository.findByEmail(request.getEmail());
        if (user == null) {
            throw new IllegalArgumentException("Email không tồn tại!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usersRepository.save(user);

        // Đánh dấu token đã sử dụng
        token.setUsed(true);
        resetTokenRepository.save(token);
    }
}
