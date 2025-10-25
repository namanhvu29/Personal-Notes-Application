package com.webnote.webnote.service;

import com.webnote.webnote.dto.request.UserCreationRequest;
import com.webnote.webnote.dto.request.UserUpdateRequest;
import com.webnote.webnote.entity.User;
import com.webnote.webnote.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(UserCreationRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());

        return userRepository.save(user);
    }

    public User updateUser(int userId, UserUpdateRequest request){
        User user = getUserById(userId);

        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());

        return userRepository.save(user);
    }

    public void deleteUser(int userId){
        userRepository.deleteById(userId);
    }
    public List<User>  getUsers(){
        return userRepository.findAll();
    }

    public User getUserById(int id){
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

}
