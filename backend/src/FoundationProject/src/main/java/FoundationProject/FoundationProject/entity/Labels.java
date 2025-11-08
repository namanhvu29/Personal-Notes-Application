package FoundationProject.FoundationProject.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Labels", schema = "dbo")
public class Labels {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int label_id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private int user_id; // Mỗi user có nhãn riêng

    public int getLabel_id() {
        return label_id;
    }

    public void setLabel_id(int label_id) {
        this.label_id = label_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getUser_id() {
        return user_id;
    }

    public void setUser_id(int user_id) {
        this.user_id = user_id;
    }
}
