package FoundationProject.FoundationProject.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "AdminSettings")
public class AdminSetting {

    @Id
    @Column(name = "setting_key", nullable = false, unique = true)
    private String settingKey; // Ví dụ: "site_name"

    @Column(name = "setting_value")
    private String settingValue; // Ví dụ: "NoteFlow"

    // Constructors
    public AdminSetting() {}

    public AdminSetting(String key, String value) {
        this.settingKey = key;
        this.settingValue = value;
    }

    // Getters & Setters
    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }
    public String getSettingValue() { return settingValue; }
    public void setSettingValue(String settingValue) { this.settingValue = settingValue; }
}