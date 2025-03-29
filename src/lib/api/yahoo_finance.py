import sys
sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient
import json

def get_stock_data(symbol, interval='1d', range='1y'):
    """
    從Yahoo Finance API獲取股票或期貨數據
    
    參數:
    symbol (str): 股票或期貨代碼，台灣股票加上.TW後綴，如2330.TW
    interval (str): 時間間隔，可選：1m|2m|5m|15m|30m|60m|1d|1wk|1mo
    range (str): 時間範圍，可選：1d|5d|1mo|3mo|6mo|1y|2y|5y|10y|ytd|max
    
    返回:
    dict: 股票或期貨數據
    """
    client = ApiClient()
    
    # 使用YahooFinance/get_stock_chart API
    response = client.call_api('YahooFinance/get_stock_chart', query={
        'symbol': symbol,
        'interval': interval,
        'range': range,
        'region': 'TW',  # 台灣地區
        'includeAdjustedClose': True
    })
    
    return response

if __name__ == "__main__":
    # 從命令行參數獲取股票代碼
    if len(sys.argv) >= 2:
        symbol = sys.argv[1]
    else:
        symbol = '2330.TW'  # 預設為台積電
    
    # 從命令行參數獲取時間間隔
    if len(sys.argv) >= 3:
        interval = sys.argv[2]
    else:
        interval = '1d'  # 預設為日線
    
    # 從命令行參數獲取時間範圍
    if len(sys.argv) >= 4:
        range_param = sys.argv[3]
    else:
        range_param = '1y'  # 預設為一年
    
    # 獲取股票數據
    data = get_stock_data(symbol, interval, range_param)
    
    # 輸出JSON格式的數據
    print(json.dumps(data))
