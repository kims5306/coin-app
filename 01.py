# install requests
# python -m pip install requests

import requests
import json

# KRW-BTC 마켓에 2025년 9월 5일(UTC) 이전 일봉 100개를 요청
url = "https://api.upbit.com/v1/candles/days"
params = {  
    'market': 'KRW-BTC',  
    'count': 100,
    'to': '2025-09-05 00:00:00'
}  
headers = {"accept": "application/json"}

response = requests.get(url, params=params, headers=headers)

# 응답받은 데이터를 {market}_{to}_{count}.json 형식으로 저장
market = params['market']
to = params['to'].replace(' ', '_').replace(':', '-')  # 파일명에 사용할 수 있도록 변환
count = params['count']
filename = f"{market}_{to}_{count}.json"

if response.status_code == 200:
    data = response.json()
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"데이터가 {filename} 파일로 저장되었습니다.")
    print(f"총 {len(data)}개의 일봉 데이터를 가져왔습니다.")
else:
    print(f"API 요청 실패: {response.status_code}")
    print(response.text)