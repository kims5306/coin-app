# 🚀 업비트 코인 실시간 분석기

업비트 API를 활용한 실시간 코인 데이터 분석 및 시각화 도구입니다.

## ✨ 주요 기능

### 📊 실시간 데이터 조회

- 업비트 공식 API 연동
- 8개 주요 코인 지원 (BTC, ETH, XRP, ADA, DOT, LINK, BCH, LTC)
- 사용자 지정 기간 조회 (7일~90일 또는 직접 지정)

### 📈 3개 차트 동시 표시

- **가격 차트**: 시가, 고가, 저가, 종가 라인 차트
- **거래량 차트**: 상승/하락 색상 구분 막대 차트
- **변동률 차트**: 일별 가격 변동률 막대 차트

### 🔬 고급 분석 기능

- **기술적 분석**: 이동평균선(7일, 30일), 변동성, RSI
- **가격 분석**: 기간 최고가/최저가, 평균 가격, 총 수익률
- **거래량 분석**: 평균/최대 거래량, 거래량 증감, 거래 활성도
- **종합 분석**: AI 기반 텍스트 분석 및 투자 인사이트

## 🎯 사용 방법

1. **코인 선택**: 드롭다운에서 분석할 코인 선택
2. **기간 설정**: 원하는 분석 기간 선택 또는 사용자 지정
3. **데이터 조회**: "🔍 데이터 조회" 버튼 클릭
4. **차트 확인**: 3개 차트가 동시에 생성되어 표시
5. **상세 분석**: "🔬 코인 정보/분석 보기" 버튼으로 고급 분석 확인

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Chart Library**: Chart.js + chartjs-adapter-date-fns
- **API**: 업비트 공식 REST API
- **Design**: 반응형 웹 디자인, 그라데이션 UI

## 🎨 주요 특징

- **반응형 디자인**: 데스크톱, 태블릿, 모바일 완벽 지원
- **실시간 데이터**: 업비트 공식 API로 최신 데이터 보장
- **사용자 친화적**: 직관적인 UI/UX와 로딩 상태 표시
- **고급 분석**: 전문가 수준의 기술적 지표 및 분석

## 📁 파일 구조

```
coin-app/
├── upbit_analyzer.html    # 메인 HTML 파일
├── styles.css            # CSS 스타일시트
├── script.js             # JavaScript 기능
└── README.md            # 프로젝트 설명서
```

## 🚀 실행 방법

1. 저장소 클론:

   ```bash
   git clone https://github.com/kims5306/coin-app.git
   cd coin-app
   ```

2. `upbit_analyzer.html` 파일을 웹 브라우저에서 열기

3. 인터넷 연결 확인 (업비트 API 호출 필요)

## 📊 지원 코인

| 코인         | 심볼 | 마켓 코드 |
| ------------ | ---- | --------- |
| 비트코인     | BTC  | KRW-BTC   |
| 이더리움     | ETH  | KRW-ETH   |
| 리플         | XRP  | KRW-XRP   |
| 에이다       | ADA  | KRW-ADA   |
| 폴카닷       | DOT  | KRW-DOT   |
| 체인링크     | LINK | KRW-LINK  |
| 비트코인캐시 | BCH  | KRW-BCH   |
| 라이트코인   | LTC  | KRW-LTC   |

## ⚠️ 주의사항

- 이 도구는 투자 참고용이며, 투자 결정의 책임은 사용자에게 있습니다
- 업비트 API 호출 제한 (최대 200개 캔들 데이터)
- 인터넷 연결이 필요합니다

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의나 버그 리포트는 GitHub Issues를 이용해주세요.

---

⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!
