# 경량 Nginx 이미지 사용
FROM nginx:alpine

# 작업 디렉토리 설정
WORKDIR /usr/share/nginx/html

# 모든 파일을 nginx 웹 루트로 복사
COPY . .

# nginx 설정 파일 생성
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index upbit_analyzer.html; \
    \
    # 메인 앱으로 리다이렉트 \
    location = / { \
        return 301 /upbit_analyzer.html; \
    } \
    \
    # 정적 파일 서빙 \
    location / { \
        try_files $uri $uri/ /upbit_analyzer.html; \
    } \
    \
    # CORS 헤더 추가 (업비트 API 호출용) \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        add_header Access-Control-Allow-Origin "*"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 포트 80 노출
EXPOSE 80

# nginx 시작
CMD ["nginx", "-g", "daemon off;"]
