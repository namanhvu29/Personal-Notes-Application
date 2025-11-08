package FoundationProject.FoundationProject.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "NoteLabels", schema = "dbo")
public class NoteLabels {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "note_id", nullable = false)
    private int noteId;   // đổi tên thành camelCase

    @Column(name = "label_id", nullable = false)
    private int labelId;  // đổi tên thành camelCase

    // Getter & Setter
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getNoteId() { return noteId; }
    public void setNoteId(int noteId) { this.noteId = noteId; }

    public int getLabelId() { return labelId; }
    public void setLabelId(int labelId) { this.labelId = labelId; }
}
