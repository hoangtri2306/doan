# Notebooks — AI Moderation & NLP Pipeline

Thư mục này chứa toàn bộ các notebook và tập dữ liệu (dataset) dùng để **thu thập, chuẩn hóa, sinh dữ liệu tổng hợp**, và **huấn luyện / so sánh các mô hình NLP kiểm duyệt văn bản** (XLM-RoBERTa, PhoBERT, InfoXLM, mBERT) cho hệ thống Blog Platform.

---

## 1. Danh sách các tệp trong thư mục (`notebook/`)

### 📜 Notebooks (.ipynb)

| Tệp notebook | Mô tả / Vai trò |
|---|---|
| `xlm-roberta-.ipynb` | **Mô hình chính (Production Candidate)**: Fine-tune **XLM-RoBERTa-base** cho bài toán Multi-label Classification (`toxic` + `spam`) với custom loss (`pos_weight`), warmup LR và tối ưu threshold riêng per-task. |
| `phobert.ipynb` | Fine-tune mô hình **PhoBERT** (`vinai/phobert-base-v2`) — dùng để benchmark so sánh. |
| `infoxlm.ipynb` | Fine-tune mô hình **InfoXLM** (`microsoft/infoxlm-base`) — dùng để benchmark so sánh. |
| `bert.ipynb` | Fine-tune mô hình **mBERT** (`bert-base-multilingual-cased`) — baseline cổ điển để so sánh. |
| `spam.ipynb` | Tiền xử lý dataset kiểm duyệt text: chuẩn hóa 7 nguồn dữ liệu gốc, làm sạch, khử trùng lặp và upsampling. |
| `bìnhthuong.ipynb` | Sinh 10.000 mẫu bình luận bình thường (Ham) tiếng Việt bằng LLM local (Ollama + Qwen 2.5:7b) kết hợp deduplication & mutation. |

### 📊 Tập dữ liệu (.csv)

| Tệp CSV | Dung lượng | Số lượng mẫu | Mô tả |
|---|---|---|---|
| `vietnamese_ham_dataset.csv` | ~3.15 MB | ~10.000 mẫu | Dữ liệu bình luận bình thường (clean/ham) tiếng Việt sinh bởi Ollama/Qwen. |
| `vietnamese_spam_dataset_kaggle.csv` | ~3.22 MB | ~39.000+ mẫu | Dữ liệu spam và toxic tiếng Việt tổng hợp và chuẩn hóa cho Kaggle. |

---

## 2. Chi tiết từng Notebook & Dataset

### 2.1 `xlm-roberta-.ipynb` — Model Kiểm duyệt Văn bản Chính (Production Candidate)

**Mục đích:** Huấn luyện `xlm-roberta-base` đa ngôn ngữ chuyên biệt cho bài toán Multi-label classification (phát hiện đồng thời `toxic` và `spam`).

- **Cải tiến cốt lõi**:
  - Xử lý mất cân bằng dữ liệu với `pos_weight` trong `BCEWithLogitsLoss`.
  - Tối ưu hóa ngưỡng quyết định (threshold) riêng biệt cho từng task (`toxic_threshold` và `spam_threshold`) dựa trên Validation set.
  - Sử dụng Cosine Annealing / Warmup schedule với `warmup_ratio=0.06` qua 4 epoch.
- **Output**: xuất mô hình tại `./final_moderation_model_v2/` (được đưa vào `final_model/` ở thư mục gốc project).

---

### 2.2 `phobert.ipynb`, `infoxlm.ipynb`, `bert.ipynb` — Thử nghiệm & Benchmark So sánh

Các notebook so sánh hiệu năng của các kiến trúc NLP khác nhau trên cùng tập dữ liệu:
- `phobert.ipynb` (`vinai/phobert-base-v2`): Tối ưu cho riêng tiếng Việt.
- `infoxlm.ipynb` (`microsoft/infoxlm-base`): Mô hình đa ngôn ngữ cải tiến từ họ RoBERTa.
- `bert.ipynb` (`bert-base-multilingual-cased`): Baseline đa ngôn ngữ cổ điển.

---

### 2.3 `spam.ipynb` — Chuẩn bị & Cân bằng Dataset

- Nạp và chuẩn hóa 7 tập dữ liệu gốc (ViCTSD, ViHSD, ViSpamReviews, SyntheticHam, SyntheticSpam, Jigsaw Toxic...).
- Tiền xử lý chữ viết (Unicode NFKC, xóa ký tự ẩn, lọc độ dài).
- Upsample các tập dữ liệu thiểu số (Spam/Toxic).
- Tạo dữ liệu đa nhãn Synthetic Toxic+Spam bằng cách ghép chuỗi toxic với các template CTA spam.
- Output: `moderation_dataset_v2.csv`.

---

### 2.4 `bìnhthuong.ipynb` — Sinh Dữ liệu Ham bằng LLM Local

- **Công cụ**: Ollama + model `Qwen 2.5:7b`.
- **Phương pháp**: Sinh dữ liệu theo 4 nhóm chủ đề và 7 persona người dùng.
- **Khử trùng lặp**: Semantic Deduplication bằng `paraphrase-multilingual-MiniLM-L12-v2` (threshold cosine 0.87).
- Output: `vietnamese_ham_dataset.csv`.

---

## 3. Thứ tự Chạy Pipeline Tái tạo (Replication Order)

```
1. bìnhthuong.ipynb    → Sinh dữ liệu bình thường (xuất vietnamese_ham_dataset.csv)
2. spam.ipynb          → Chuẩn hóa & hợp nhất các nguồn dữ liệu toxic/spam (xuất moderation_dataset_v2.csv)
3. xlm-roberta-.ipynb → Huấn luyện & đánh giá XLM-RoBERTa chính (xuất final_moderation_model_v2)

(Các notebook so sánh benchmark):
├── phobert.ipynb      → Train PhoBERT so sánh
├── infoxlm.ipynb      → Train InfoXLM so sánh
└── bert.ipynb         → Train mBERT so sánh
```

---

## 4. Vị trí Mô hình Sau khi Export

```
doan/
└── final_model/                  ← XLM-RoBERTa (kiểm duyệt text)
    ├── model.safetensors
    └── config.json
```