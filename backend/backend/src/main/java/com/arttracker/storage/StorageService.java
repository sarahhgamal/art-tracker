package com.arttracker.storage;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    @Value("${supabase.bucket}")
    private String bucket;

    private final OkHttpClient httpClient = new OkHttpClient();

    public String uploadFile(MultipartFile file) throws IOException{
        String extension = getExtension(file.getOriginalFilename());

        String fileName = UUID.randomUUID() + "." + extension;

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + fileName;

        RequestBody body = RequestBody.create(
                file.getBytes(),
                MediaType.parse(file.getContentType())
        );

        Request request = new Request.Builder()
                .url(uploadUrl)
                .header("Authorization", "Bearer " + serviceRoleKey)
                .header("Content-Type", file.getContentType())
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Supabase upload failed: " + response.code() + " " + response.body().string());
            }
        }

        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + fileName;

    }

    public void deleteFile(String imageUrl) throws IOException {
        if (imageUrl == null || !imageUrl.contains(bucket)) return;

        String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + fileName;

        Request request = new Request.Builder()
                .url(deleteUrl)
                .header("Authorization", "Bearer " + serviceRoleKey)
                .delete()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Supabase delete failed: " + response.code());
            }
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}



