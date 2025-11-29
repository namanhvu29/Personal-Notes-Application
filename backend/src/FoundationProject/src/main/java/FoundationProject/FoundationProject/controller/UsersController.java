package FoundationProject.FoundationProject.controller;

import FoundationProject.FoundationProject.dto.request.ForgotPasswordRequest;
import FoundationProject.FoundationProject.dto.request.ResetPasswordRequest;
import FoundationProject.FoundationProject.dto.request.UsersCreationRequest;
import FoundationProject.FoundationProject.dto.request.UsersRegisterRequest;
import FoundationProject.FoundationProject.dto.request.UsersLoginRequest;
import FoundationProject.FoundationProject.dto.request.VerifyResetCodeRequest;
import FoundationProject.FoundationProject.entity.Users;
import FoundationProject.FoundationProject.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UsersController {

    @Autowired
    private UsersService usersService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ĐĂNG KÝ NGƯỜI DÙNG
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UsersRegisterRequest request) {
        try {
            usersService.register(request);
            return ResponseEntity.ok("Đăng ký thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi server, vui lòng thử lại!");
        }
    }

    // ĐĂNG NHẬP NGƯỜI DÙNG
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsersLoginRequest request) {
        try {
            Users user = usersService.findByUsernameOrEmail(request.getUsernameOrEmail());
            if (user == null) {
                return ResponseEntity.badRequest().body("Tài khoản không tồn tại!");
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Sai mật khẩu!");
            }

            return ResponseEntity.ok("Đăng nhập thành công!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // ========================================
    // QUÊN MẬT KHẨU - GỬI MÃ RESET
    // ========================================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            usersService.sendResetCode(request.getEmail());
            return ResponseEntity.ok("Mã xác thực đã được gửi đến email của bạn!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi gửi email: " + e.getMessage());
        }
    }

    // ========================================
    // XÁC THỰC MÃ RESET
    // ========================================
    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody VerifyResetCodeRequest request) {
        try {
            boolean isValid = usersService.verifyResetCode(request.getEmail(), request.getCode());
            if (isValid) {
                return ResponseEntity.ok("Mã xác thực hợp lệ!");
            } else {
                return ResponseEntity.badRequest().body("Mã xác thực không đúng hoặc đã hết hạn!");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // ========================================
    // ĐẶT LẠI MẬT KHẨU
    // ========================================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            usersService.resetPassword(
                    request.getEmail(),
                    request.getCode(),
                    request.getNewPassword(),
                    request.getConfirmPassword());
            return ResponseEntity.ok("Đặt lại mật khẩu thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // CRUD
    @PostMapping
    public Users createUsers(@RequestBody UsersCreationRequest request) {
        return usersService.createUsers(request);
    }

    @GetMapping
    public List<Users> getUsers() {
        return usersService.getUsers();
    }

    @GetMapping("/{usersId}")
    public Users getUsers(@PathVariable("usersId") int usersId) {
        return usersService.getUsersById(usersId);
    }

    @PutMapping("/{usersId}")
    public Users updateUsers(@PathVariable("usersId") int usersId, @RequestBody UsersUpdateRequest request) {
        return usersService.updateUsers(usersId, request);
    }

    @DeleteMapping("/{usersId}")
    public String deleteUsers(@PathVariable int usersId) {
        usersService.deleteUser(usersId);
        return "Users has been deleted";
    }
}
