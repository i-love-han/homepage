import os
import re
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime

PORT = 8000

def natural_sort_key(item):
    """파일명에서 숫자를 추출하여 자연스러운 순서로 정렬"""
    filename = item['filename']
    # 파일명에서 숫자 부분 추출
    numbers = re.findall(r'\d+', filename)
    if numbers:
        # 첫 번째 숫자를 정수로 변환하여 정렬 키로 사용
        return int(numbers[0])
    return 0

class CustomHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp')
        
        # /api/images - 갤러리 이미지 (images/gallery)
        if self.path == '/api/images':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            images_dir = os.path.join(base_dir, 'images', 'gallery')
            images = []
            
            if os.path.exists(images_dir):
                for filename in os.listdir(images_dir):
                    if filename.lower().endswith(extensions):
                        filepath = os.path.join(images_dir, filename)
                        mtime = os.path.getmtime(filepath)
                        images.append({
                            'filename': filename,
                            'path': 'images/gallery/' + filename,
                            'uploadedAt': datetime.fromtimestamp(mtime).strftime('%Y-%m-%dT%H:%M:%S.000Z')
                        })
            
            images.sort(key=natural_sort_key, reverse=True)
            print("Sorted images:", [img['filename'] for img in images]) # Debug log
            self.wfile.write(json.dumps(images, ensure_ascii=False).encode('utf-8'))
        
        # /api/popup - 팝업 이미지 (images/popup)
        elif self.path == '/api/popup':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            popup_dir = os.path.join(base_dir, 'images', 'popup')
            popups = []
            
            if os.path.exists(popup_dir):
                for filename in os.listdir(popup_dir):
                    if filename.lower().endswith(extensions):
                        popups.append({
                            'filename': filename,
                            'path': 'images/popup/' + filename
                        })
            
            popups.sort(key=lambda x: x['filename'])
            self.wfile.write(json.dumps(popups, ensure_ascii=False).encode('utf-8'))
        
        # /api/background - 메인 배경 이미지 (images/main)
        elif self.path == '/api/background':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            bg_dir = os.path.join(base_dir, 'images', 'main')
            background = None
            
            if os.path.exists(bg_dir):
                for filename in os.listdir(bg_dir):
                    if filename.lower().endswith(extensions):
                        background = 'images/main/' + filename
                        break
            
            result = {'path': background} if background else {'path': None}
            self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))

        # /api/content - 텍스트 콘텐츠 (content.txt)
        elif self.path == '/api/content':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            content_file = os.path.join(base_dir, 'content.txt')
            content = {}
            
            if os.path.exists(content_file):
                try:
                    with open(content_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            line = line.strip()
                            if '=' in line:
                                key, value = line.split('=', 1)
                                content[key.strip()] = value.strip().replace('\\n', '\n')
                except Exception as e:
                    print(f"Error reading content.txt: {e}")
            
            self.wfile.write(json.dumps(content, ensure_ascii=False).encode('utf-8'))

        # /api/people - 소개 섹션 이미지 (images/people)
        elif self.path == '/api/people':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            people_dir = os.path.join(base_dir, 'images', 'people')
            people_images = []
            
            if os.path.exists(people_dir):
                for filename in os.listdir(people_dir):
                    if filename.lower().endswith(extensions):
                        people_images.append({
                            'filename': filename,
                            'path': 'images/people/' + filename
                        })
            
            # 파일명 순 정렬
            people_images.sort(key=lambda x: x['filename'])
            self.wfile.write(json.dumps(people_images, ensure_ascii=False).encode('utf-8'))
        
        else:
            super().do_GET()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(('', PORT), CustomHandler)
    print()
    print('=' * 50)
    print('  웹 서버 시작!')
    print('=' * 50)
    print()
    print(f'  http://localhost:{PORT} 에서 확인하세요')
    print()
    print('  폴더 구조:')
    print('    images/gallery - 갤러리 이미지')
    print('    images/main    - 메인 배경')
    print('    images/popup   - 팝업 이미지')
    print()
    print('  (서버 종료: Ctrl+C)')
    print('=' * 50)
    print()
    server.serve_forever()
