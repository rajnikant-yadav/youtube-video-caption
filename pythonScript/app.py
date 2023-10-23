
from flask import Flask, request
from youtube_transcript_api import YouTubeTranscriptApi
app = Flask(__name__)


@app.route('/', methods=['GET'])
def hello_world():
    return 'Caption Serach APi!'


@app.route('/getcaption', methods=['POST'])
def post_data():
    try:
        data = request.get_json()
        srt = YouTubeTranscriptApi.get_transcript(
            data["id"], languages=['ja', 'en'])
        # Do something with the received data
        return srt
    except Exception as e:
        print(str(e))
        return 'Error: {}'.format(str(e)), 404


if __name__ == '__main__':
    app.run(port=8000)
