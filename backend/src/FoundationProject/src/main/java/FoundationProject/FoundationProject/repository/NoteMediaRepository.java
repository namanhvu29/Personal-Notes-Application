package FoundationProject.FoundationProject.repository;

import FoundationProject.FoundationProject.entity.NoteMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteMediaRepository extends JpaRepository<NoteMedia, Integer> {

    List<NoteMedia> findByNoteId(int noteId);

}
