---
title: "Kubernetes NetworkPolicy 처음 써보기"
date: 2026-11-24
tags: ["kubernetes", "devlog"]
summary: "기본 거부 정책부터 시작해 필요한 통신만 여는 순서"
---

## 기본 거부부터

"모두 막고 필요한 것만 연다"가 출발점입니다.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

## 그다음

- 같은 네임스페이스 안에서 필요한 통신만 허용합니다.
- DNS(UDP 53)는 먼저 열어 두지 않으면 거의 모든 것이 멈춥니다.
