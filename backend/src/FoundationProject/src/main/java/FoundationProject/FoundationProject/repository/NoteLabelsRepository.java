package FoundationProject.FoundationProject.repository;

import FoundationProject.FoundationProject.entity.NoteLabels;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NoteLabelsRepository extends JpaRepository<NoteLabels, Integer> {

    // Query tìm theo noteId
    @Query("SELECT nl FROM NoteLabels nl WHERE nl.noteId = :noteId")
    List<NoteLabels> findByNoteId(@Param("noteId") int noteId);

    // Query tìm theo labelId
    @Query("SELECT nl FROM NoteLabels nl WHERE nl.labelId = :labelId")
    List<NoteLabels> findByLabelId(@Param("labelId") int labelId);

    // Xóa theo noteId
    void deleteByNoteId(int noteId);
}
