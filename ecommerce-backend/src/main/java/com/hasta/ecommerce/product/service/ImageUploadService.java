package com.hasta.ecommerce.product.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.hasta.ecommerce.common.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class ImageUploadService {

    private final Cloudinary cloudinary;

    public ImageUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @SuppressWarnings("unchecked")
    public String upload(MultipartFile file) {
        validateFile(file);

        try {
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "ecommerce-products",
                    "resource_type", "image"
            ));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new BadRequestException("Gagal upload gambar: " + e.getMessage());
        }
    }

    public void delete(String imageUrl) {
        String publicId = extractPublicId(imageUrl);
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            // Gagal hapus di Cloudinary tidak seharusnya menggagalkan seluruh request -
            // cukup log, biarkan proses hapus dari database tetap lanjut
            System.err.println("Gagal hapus gambar dari Cloudinary: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File gambar tidak boleh kosong");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File harus berupa gambar (JPG, PNG, dll)");
        }

        long maxSizeBytes = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSizeBytes) {
            throw new BadRequestException("Ukuran gambar maksimal 5MB");
        }
    }

    private String extractPublicId(String secureUrl) {
        // Contoh URL: https://res.cloudinary.com/xxx/image/upload/v1234567890/ecommerce-products/abc123.jpg
        // Public ID yang dibutuhkan Cloudinary buat delete: ecommerce-products/abc123
        String afterUpload = secureUrl.substring(secureUrl.indexOf("/upload/") + 8);
        String withoutVersion = afterUpload.replaceFirst("^v\\d+/", "");
        int lastDot = withoutVersion.lastIndexOf('.');
        return lastDot > 0 ? withoutVersion.substring(0, lastDot) : withoutVersion;
    }
}