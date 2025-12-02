package FoundationProject.FoundationProject.dto.response;

public class AdminDashboardStatsDto {
    private long totalUsers;
    private long totalNotes;

    public AdminDashboardStatsDto(long totalUsers, long totalNotes) {
        this.totalUsers = totalUsers;
        this.totalNotes = totalNotes;
    }

    public long getTotalUsers() { return totalUsers; }
    public long getTotalNotes() { return totalNotes; }
}