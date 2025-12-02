package FoundationProject.FoundationProject.service;

import FoundationProject.FoundationProject.dto.response.AdminDashboardStatsDto;
import FoundationProject.FoundationProject.dto.response.AdminNoteDto;
import FoundationProject.FoundationProject.entity.AdminHistoryLog;
import FoundationProject.FoundationProject.entity.Notes;
import FoundationProject.FoundationProject.entity.Users;
import FoundationProject.FoundationProject.repository.AdminHistoryLogRepository;
import FoundationProject.FoundationProject.repository.NotesRepository;
import FoundationProject.FoundationProject.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private NotesRepository notesRepository;

    @Autowired
    private AdminHistoryLogRepository logRepository;

    //Lấy thống kê
    public AdminDashboardStatsDto getDashboardStats() {
        long totalUsers = usersRepository.count(); // Đếm tổng user
        long totalNotes = notesRepository.count(); // Đếm tổng note
        return new AdminDashboardStatsDto(totalUsers, totalNotes);
    }

    //Xóa Note (Dành cho Admin)
    public void deleteNoteByAdmin(int noteId) {
        // Tìm note để lấy thông tin trước khi xóa (để ghi log)
        Notes note = notesRepository.findById(noteId).orElse(null);

        if (note != null) {
            String noteTitle = note.getTitle();

            // Xóa note
            notesRepository.deleteById(noteId);

            //Ghi lại lịch sử hành động
            String actionDescription = "Đã xóa ghi chú: " + noteTitle + " (ID: " + noteId + ")";
            AdminHistoryLog log = new AdminHistoryLog(actionDescription, "Admin"); // Mặc định tên là "Admin"
            logRepository.save(log);
        } else {
            throw new RuntimeException("Note không tồn tại");
        }
    }

    //Lấy danh sách lịch sử
    public List<AdminHistoryLog> getAllLogs() {
        return logRepository.findAllByOrderByTimestampDesc();
    }

    //Lấy danh sách tất cả Notes cho Admin
    public List<AdminNoteDto> getAllNotesForAdmin() {
        // Lấy tất cả notes, sắp xếp mới nhất lên đầu
        List<Notes> allNotes = notesRepository.findAll();

        List<AdminNoteDto> responseList = new ArrayList<>();

        for (Notes note : allNotes) {
            //Tìm tên người dùng dựa trên user_id
            String username = "Unknown User";
            Users user = usersRepository.findById(note.getUser_id()).orElse(null);
            if (user != null) {
                username = user.getUsername();
            }

            //Tạo DTO và thêm vào danh sách
            responseList.add(new AdminNoteDto(
                    note.getNote_id(),
                    note.getTitle(),
                    note.getContent(),
                    username,
                    note.getCreated_at()
            ));
        }

        return responseList;
    }
}

