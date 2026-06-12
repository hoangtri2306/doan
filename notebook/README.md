# Notebooks — AI Moderation & NLP Pipeline

Thư mục này chứa toàn bộ notebook Kaggle dùng để **thu thập dữ liệu**, **fine-tune model NLP** và **train model kiểm duyệt hình ảnh** cho hệ thống Blog Platform.

---

## Tổng quan kiến trúc AI

```
Blog Platform
├── Kiểm duyệt văn bản  →  XLM-RoBERTa (multi-label: spam + toxic)
├── Tóm tắt bài viết    →  mT5-base (multi-task: summarize + suggest tags)
└── Kiểm duyệt hình ảnh →  EfficientNet-B0 / ResNet-50 / ViT-base (3 class: SAFE / NSFW / VIOLENCE)
```

---

## Danh sách notebooks

### 1. `kaggle_crawl_vnexpress.ipynb` — Thu thập dữ liệu huấn luyện

**Mục đích:** Crawl ~20,000 bài báo từ 4 trang tin tức tiếng Việt để tạo dataset cho fine-tune mT5.

**Nguồn dữ liệu:**

| Nguồn | Số chuyên mục | Số trang/mục | Ước tính bài |
|-------|--------------|-------------|-------------|
| VnExpress (`vnexpress.net`) | 16 | 70 | ~9,400 |
| Tuổi Trẻ (`tuoitre.vn`) | 12 | 55 | ~4,300 |
| Dân Trí (`dantri.com.vn`) | 10 | 55 | ~3,600 |
| Thanh Niên (`thanhnien.vn`) | 10 | 45 | ~2,900 |
| **Tổng** | | | **~20,200** |

**Mỗi bài viết gồm:** `title`, `content`, `summary` (sapo), `tags`, `source`

**Yêu cầu Kaggle:**
- Internet: **BẬT** (Settings > Internet > On)
- Accelerator: không cần GPU

**Thứ tự chạy:**
1. Chạy cell **DEBUG** trước để kiểm tra selector hoạt động — xem output `✓ vne_crawl() OK!`
2. Nếu debug OK → chạy toàn bộ từ đầu
3. Ước tính thời gian: **8–12 tiếng** (có delay giữa request để tránh bị block)

**Output:** `/kaggle/working/vnexpress_dataset.json`

---

### 2. `kaggle_finetune_mt5.ipynb` — Fine-tune mT5-base (tóm tắt + đề xuất tag)

**Mục đích:** Fine-tune `google/mt5-base` (~580M params) để thực hiện 2 task trong 1 model.

**Multi-task learning:**
- **Task 1 — Tóm tắt:** `"summarize: {title} </s> {content}"` → tóm tắt ngắn (sapo)
- **Task 2 — Đề xuất tag:** `"suggest tags: {title} </s> {content}"` → danh sách tag, phân cách dấu phẩy

**Cấu hình training:**

| Tham số | Giá trị | Lý do |
|---------|---------|-------|
| Model | `google/mt5-base` | 580M params, cân bằng tốt quality/speed |
| Optimizer | AdaFactor | Thiết kế riêng cho T5, tiết kiệm VRAM |
| Batch size | 4 per GPU (effective=32) | Base lớn hơn small |
| Epochs | 6 (có early stopping) | Dừng sớm nếu ROUGE-L không cải thiện |
| Label smoothing | 0.1 | Tránh overfit |
| Learning rate | 3e-4 | Phù hợp AdaFactor |

**Đánh giá:** ROUGE-1, ROUGE-2, ROUGE-L riêng cho từng task trên tập validation.

**Yêu cầu Kaggle:**
- Accelerator: **GPU T4 × 2** hoặc P100
- Internet: **BẬT** (lần đầu tải model)
- Upload `vnexpress_dataset.json` vào phần **Input** (Add Data > Upload)

**Ước tính thời gian:** ~4–6 giờ với T4 × 2

**Output:** `/kaggle/working/mt5-multitask-final.zip` — giải nén vào `final_model_mt5/`

---

### 3. `kaggle_train_image_model.ipynb` — So sánh 3 model kiểm duyệt ảnh

**Mục đích:** Train và so sánh 3 kiến trúc CNN/ViT để chọn model tốt nhất cho production.

**3 class phân loại:**

| Nhãn | Mô tả |
|------|-------|
| `SAFE` (0) | Ảnh bình thường, an toàn |
| `NSFW` (1) | Nội dung 18+, khiêu dâm |
| `VIOLENCE` (2) | Bạo lực, máu me |

**3 model so sánh (đều dùng `timm`, `pretrained=True`):**

| Model | Params | Đặc điểm |
|-------|--------|-----------|
| `efficientnet_b0` | ~5.3M | Nhẹ, nhanh, phù hợp production |
| `resnet50` | ~25M | Baseline kinh điển, ổn định |
| `vit_base_patch16_224` | ~86M | Transformer-based, attention toàn cục |

**Dataset (~30,000 ảnh, cân bằng 10k/class):**
- `Falconsai/nsfw_image_detection` (HuggingFace) → class SAFE + NSFW
- `Real Life Violence Situations Dataset` (Kaggle) → class VIOLENCE

**Thêm violence dataset:** Add Data > tìm `"Real Life Violence Situations Dataset"` > Add vào notebook

**Cấu hình training:**
- Optimizer: AdamW + CosineAnnealingLR
- Batch: 64/GPU, Epochs: 10 (early stopping patience=3)
- Data augmentation: RandomCrop, RandomHorizontalFlip, ColorJitter

**Kết quả output:**
- `training_curves.png` — biểu đồ loss/accuracy 3 model
- `confusion_matrices.png` — confusion matrix từng model
- `comparison_results.json` — bảng so sánh số liệu
- `best_image_model.zip` — model tốt nhất kèm `meta.json`

**Yêu cầu Kaggle:**
- Accelerator: **GPU T4 × 2** hoặc P100
- Internet: **BẬT**

**Ước tính thời gian:** ~1–2h/model × 3 = **4–6 giờ tổng**

---

### 4. `xlm-roberta-.ipynb` — Fine-tune XLM-RoBERTa (kiểm duyệt văn bản)

**Mục đích:** Fine-tune `xlm-roberta-base` cho bài toán **multi-label classification**: phát hiện đồng thời spam và toxic trong cùng một lần inference.

**Dataset training (~192,000 examples sau augment):**

| Nguồn | Loại | Kích thước |
|-------|------|-----------|
| Jigsaw Toxic Comments | toxic (en) | ~92k |
| ViHSD | toxic (vi) | ~28k |
| ViSpamReviews (upsampled) | spam (vi) | ~39k |
| SyntheticSpam | spam (vi) | ~8k |
| SyntheticHam | clean (vi) | ~6.5k |
| EnglishSpam | spam (en) | ~6.4k |
| ViCTSD | toxic (vi) | ~6.4k |
| SyntheticToxicSpam | spam+toxic (vi) | 5k |

**Output:** `./final_moderation_model_v2/` → copy vào `final_model/` trong project

---

### 5. `spam.ipynb` — Chuẩn bị dataset kiểm duyệt văn bản

**Mục đích:** Pipeline chuẩn bị và cân bằng dataset để train XLM-RoBERTa. Bao gồm:
- Load + chuẩn hóa 7 nguồn dữ liệu (ViCTSD, ViHSD, ViSpamReviews, Jigsaw, ...)
- Cleaning và deduplication
- Upsample minority class (spam/toxic)
- Tạo dữ liệu tổng hợp `SyntheticToxicSpam` bằng cách ghép text toxic + spam CTA template

**Output:** `/kaggle/working/moderation_dataset_v2.csv`

---

### 6. `phobert.ipynb`, `infoxlm.ipynb`, `bert.ipynb` — Các model so sánh

Cùng kiến trúc pipeline với `xlm-roberta-.ipynb`, chỉ thay `MODEL_NAME`:

| Notebook | Model | Ghi chú |
|----------|-------|---------|
| `phobert.ipynb` | `vinai/phobert-base-v2` | Chuyên tiếng Việt |
| `infoxlm.ipynb` | `microsoft/infoxlm-base` | Cross-lingual, họ hàng XLM-R |
| `bert.ipynb` | `bert-base-multilingual-cased` | mBERT, baseline cổ điển |

Dùng để **so sánh** với XLM-RoBERTa trong phần thực nghiệm luận văn.

---

### 7. `bìnhthuong.ipynb` — Sinh dữ liệu Ham (bình thường)

**Mục đích:** Tạo 10,000 bình luận tiếng Việt bình thường (ham/clean) bằng LLM local (Ollama + Qwen 2.5:7b) để bổ sung vào dataset training kiểm duyệt.

**Kỹ thuật:**
- Sử dụng 4 taxonomy (casual chat, Q&A, review, work/study) và 7 persona người dùng để đa dạng hóa nội dung
- Semantic deduplication bằng `paraphrase-multilingual-MiniLM-L12-v2` (threshold cosine 0.87)
- SQLite checkpointing để resume nếu bị ngắt giữa chừng
- Mutation: viết tắt tiếng Việt + emoji để giả lập văn phong tự nhiên

**Output:** `/kaggle/working/vietnamese_ham_dataset.csv`

---

## Thứ tự chạy để tái tạo toàn bộ pipeline

```
1. spam.ipynb              → chuẩn bị dataset text moderation
2. bìnhthuong.ipynb        → sinh thêm dữ liệu ham
3. xlm-roberta-.ipynb      → train model kiểm duyệt chính
   phobert.ipynb           → (song song, để so sánh)
   infoxlm.ipynb           → (song song, để so sánh)
   bert.ipynb              → (song song, để so sánh)

4. kaggle_crawl_vnexpress.ipynb  → crawl dữ liệu báo
5. kaggle_finetune_mt5.ipynb     → fine-tune tóm tắt + tag

6. kaggle_train_image_model.ipynb → train 3 model ảnh
```

---

## Vị trí model sau khi train xong

```
doan/
├── final_model/                  ← XLM-RoBERTa (đã có)
│   ├── model.safetensors
│   └── config.json
├── final_model_mt5/              ← mT5-base (sau khi download từ Kaggle)
│   ├── pytorch_model.bin
│   └── config.json
└── final_model_image/            ← Best image model (sau khi download từ Kaggle)
    ├── model.pt
    └── meta.json
```