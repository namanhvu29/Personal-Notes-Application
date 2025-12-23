package FoundationProject.FoundationProject.service;

import FoundationProject.FoundationProject.entity.Labels;
import FoundationProject.FoundationProject.repository.LabelsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabelsService {

    @Autowired
    private LabelsRepository labelsRepository;

    public Labels createLabel(int userId, String name) {
        Labels label = new Labels();
        label.setUser_id(userId);
        label.setName(name);
        return labelsRepository.save(label);
    }

    public List<Labels> getLabelsByUser(int userId) {
        return labelsRepository.findByUserId(userId);
    }

    public List<Labels> searchLabels(int userId, String keyword) {
        return labelsRepository.searchLabels(userId, keyword);
    }

    public void deleteLabel(int labelId) {
        labelsRepository.deleteById(labelId);
    }

    public List<Labels> getAllLabels() {
        return labelsRepository.findAll();
    }

}
