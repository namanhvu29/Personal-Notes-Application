package FoundationProject.FoundationProject.service;

import FoundationProject.FoundationProject.controller.UsersUpdateRequest;
import FoundationProject.FoundationProject.dto.request.UsersCreationRequest;
import FoundationProject.FoundationProject.dto.request.UsersRegisterRequest;
import FoundationProject.FoundationProject.entity.PasswordResetToken;
import FoundationProject.FoundationProject.entity.Users;
import FoundationProject.FoundationProject.repository.PasswordResetTokenRepository;
import FoundationProject.FoundationProject.repository.UsersRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.regex.Pattern;

@Service
public class UsersService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private EmailService emailService;

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

    // ========================================
    // QUÊN MẬT KHẨU - GỬI MÃ RESET
    // ========================================
    @Transactional
    public void sendResetCode(String email) {
        // Kiểm tra email có tồn tại không
        Users user = usersRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("Email không tồn tại trong hệ thống!");
        }

        // Xóa các token cũ của email này
        resetTokenRepository.deleteByEmail(email);

        // Tạo mã ngẫu nhiên 6 chữ số
        String resetCode = String.format("%06d", new Random().nextInt(999999));

        // Lưu token vào database
        PasswordResetToken token = new PasswordResetToken();
        token.setEmail(email);
        token.setResetCode(resetCode);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(10)); // Hết hạn sau 10 phút
        token.setUsed(false);
        resetTokenRepository.save(token);

        // Gửi email
        emailService.sendResetCode(email, resetCode);
    }

    // ========================================
    // XÁC THỰC MÃ RESET
    // ========================================
    public boolean verifyResetCode(String email, String code) {
        var tokenOpt = resetTokenRepository.findByEmailAndResetCodeAndUsedFalse(email, code);

        if (tokenOpt.isEmpty()) {
            return false;
        }

        PasswordResetToken token = tokenOpt.get();

        // Kiểm tra xem token đã hết hạn chưa
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        return true;
    }

    // ========================================
    // ĐẶT LẠI MẬT KHẨU
    // ========================================
    @Transactional
    public void resetPassword(String email, String code, String newPassword, String confirmPassword) {
        // Kiểm tra mật khẩu khớp
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp!");
        }

        // Kiểm tra độ mạnh mật khẩu
        if (!isValidPassword(newPassword)) {
            throw new IllegalArgumentException("Mật khẩu phải ≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt!");
        }

        // Xác thực mã reset
        var tokenOpt = resetTokenRepository.findByEmailAndResetCodeAndUsedFalse(email, code);
        if (tokenOpt.isEmpty()) {
            throw new IllegalArgumentException("Mã xác thực không hợp lệ!");
        }

        PasswordResetToken token = tokenOpt.get();

        // Kiểm tra hết hạn
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã xác thực đã hết hạn!");
        }

        // Cập nhật mật khẩu
        Users user = usersRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("Không tìm thấy người dùng!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        usersRepository.save(user);

        // Đánh dấu token đã sử dụng
        token.setUsed(true);
        resetTokenRepository.save(token);
    }

    // CRUD
    public Users createUsers(UsersCreationRequest request) {
        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
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
}
