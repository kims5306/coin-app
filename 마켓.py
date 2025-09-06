import requests

url = "https://api.upbit.com/v1/market/all"

headers = {"accept": "application/json"}

res = requests.get(url, headers=headers)

res.json()

for i in res.json():
    print(i['market'])
    