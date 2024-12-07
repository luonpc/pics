document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const compressSettings = document.getElementById('compressSettings');
    const previewArea = document.getElementById('previewArea');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const downloadBtn = document.getElementById('downloadBtn');

    let currentFile = null; // 存储当前处理的图片文件
    let originalImage = null; // 存储原始图片对象

    // 处理拖放上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (isValidImageFile(file)) {
            handleImageUpload(file);
        } else {
            showError('请上传 PNG 或 JPG 格式的图片');
        }
    });

    // 处理点击上传
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && isValidImageFile(file)) {
            handleImageUpload(file);
        }
    });

    // 处理图片上传
    function handleImageUpload(file) {
        currentFile = file;
        originalSize.textContent = formatFileSize(file.size);

        // 创建预览
        const reader = new FileReader();
        reader.onload = (e) => {
            // 创建图片对象
            originalImage = new Image();
            originalImage.onload = () => {
                originalPreview.src = e.target.result;
                compressImage();
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // 显示压缩设置和预览区域
        compressSettings.style.display = 'block';
        previewArea.style.display = 'block';
    }

    // 压缩图片
    function compressImage() {
        if (!originalImage) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 设置画布尺寸
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;

        // 绘制图片
        ctx.drawImage(originalImage, 0, 0);

        // 压缩图片
        const quality = qualitySlider.value / 100;
        canvas.toBlob((blob) => {
            // 释放之前的 URL
            if (compressedPreview.src) {
                URL.revokeObjectURL(compressedPreview.src);
            }

            // 创建新的预览 URL
            const blobUrl = URL.createObjectURL(blob);
            compressedPreview.src = blobUrl;
            
            // 更新压缩后的文件大小
            compressedSize.textContent = formatFileSize(blob.size);
        }, currentFile.type, quality);
    }

    // 质量滑块变化时重新压缩
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
        // 直接使用存储的原始图片重新压缩
        compressImage();
    });

    // 下载按钮点击事件
    downloadBtn.addEventListener('click', () => {
        if (compressedPreview.src) {
            fetch(compressedPreview.src)
                .then(res => res.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    const extension = currentFile.type.split('/')[1];
                    link.download = `compressed-image.${extension}`;
                    link.href = url;
                    link.click();
                    window.URL.revokeObjectURL(url);
                });
        }
    });

    // 辅助函数
    function isValidImageFile(file) {
        // 检查文件大小（例如限制为 10MB）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showError('文件大小不能超过 10MB');
            return false;
        }
        
        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showError('只支持 PNG 和 JPG 格式的图片');
            return false;
        }
        
        return true;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showError(message) {
        // 可以替换为更友好的提示UI
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // 添加全局错误处理
    window.addEventListener('error', function(e) {
        console.error('Error:', e.error);
        showError('操作出错，请刷新页面重试');
    });
}); 