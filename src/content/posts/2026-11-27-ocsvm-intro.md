---
title: "OCSVM으로 이상 탐지: 정상만 보고 배우기"
date: 2026-11-27
updated: 2026-11-28
tags: ["ml", "security"]
summary: "공격 데이터 없이 정상 트래픽만으로 학습하는 이유"
---

## 왜 정상만으로 학습하나

공격 데이터는 적고 종류가 계속 바뀝니다. 정상 트래픽의 **경계**를 배우고, 경계 밖을 이상으로 보는 쪽이 현실적입니다.

### One-Class SVM

정상 데이터를 감싸는 가장 작은 영역을 찾는 방식입니다.

```python
from sklearn.svm import OneClassSVM

model = OneClassSVM(kernel="rbf", nu=0.05).fit(normal_features)
labels = model.predict(new_features)  # 1: 정상, -1: 이상
```

### 임계값

`nu`는 학습 데이터에서 이상으로 허용할 비율의 상한입니다. 너무 크면 정상을 자주 이상으로 봅니다.
